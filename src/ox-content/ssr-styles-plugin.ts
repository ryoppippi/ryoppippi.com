import path from 'node:path';
import { build, createServer, normalizePath, type Plugin, type ViteDevServer } from 'vite';
import { readFile } from 'node:fs/promises';
import { createFixture } from 'fs-fixture';
import solid from '@solidjs/vite-plugin';
import { glob } from 'tinyglobby';

const virtualId = 'virtual:site/ssr-styles';
const resolvedId = `\0${virtualId}`;

type SsrStylesOptions = {
	pages: string;
	layout: string;
};

/**
 * Discovers SSR component CSS without adding server components to the client build.
 * @param options - Page directory and shared layout module, relative to the Vite root.
 * @returns A temporary Vite integration pending Ox Content's route stylesheet contract.
 */
export function ssrStylesPlugin({ pages, layout }: SsrStylesOptions): Plugin {
	let root = '';
	let server: ViteDevServer | undefined;

	async function discover(loader: ViteDevServer, watch: (file: string) => void) {
		const entries = await glob('**/page.tsx', { cwd: path.join(root, pages) });
		async function stylesFor(entry: string) {
			const visited = new Set<string>();
			const styles = new Set<string>();
			async function visit(url: string) {
				if (visited.has(url)) return;
				visited.add(url);
				const resolved = await loader.environments.ssr.pluginContainer.resolveId(url);
				if (resolved == null || resolved.external) return;
				const file = resolved.id.split('?')[0];
				if (file.endsWith('.css')) {
					if (/[?&](?:inline|raw|url)(?:&|$)/.test(resolved.id)) return;
					if (!file.startsWith(`${root}/`)) {
						throw new Error(`SSR styles outside the project root are unsupported: ${file}`);
					}
					watch(file);
					styles.add(`/${normalizePath(path.relative(root, file))}`);
					return;
				}
				if (!file.startsWith(`${root}/`) || file.includes('/node_modules/')) return;
				watch(file);
				const transformed = await loader.transformRequest(url, { ssr: true });
				if (transformed == null) throw new Error(`Cannot discover SSR styles for ${url}`);
				if (transformed.dynamicDeps?.length) {
					throw new Error(`Dynamic SSR imports need explicit stylesheet support: ${url}`);
				}
				// Vite supplies resolved static imports in source order; no source parser is duplicated.
				for (const dependency of transformed.deps ?? []) {
					await visit(dependency);
				}
			}
			await visit(entry);
			return [...styles];
		}
		const pageStyles = Object.fromEntries(
			await Promise.all(
				entries.map(
					async (entry) =>
						[
							path.posix.dirname(entry),
							await stylesFor(`/${pages}/${entry}`),
						] as const satisfies readonly [string, string[]],
				),
			),
		);
		return { sharedStyles: await stylesFor(`/${layout}`), pageStyles };
	}

	return {
		name: 'site:ssr-styles',
		configResolved(config) {
			root = normalizePath(config.root);
		},
		configureServer(devServer) {
			server = devServer;
		},
		hotUpdate({ file, type }) {
			if (type === 'update' || !file.startsWith(`${root}/${pages}/`) || !file.endsWith('/page.tsx'))
				return;
			// A new page has no edge in the previous virtual module's watched dependency set.
			const module = this.environment.moduleGraph.getModuleById(resolvedId);
			if (module != null) this.environment.moduleGraph.invalidateModule(module);
		},
		async buildStart() {
			if (this.environment.config.command !== 'build') return;
			// A transform-only SSR environment resolves imports without evaluating page/server code.
			const loader = await createServer({
				root,
				configFile: false,
				appType: 'custom',
				resolve: { tsconfigPaths: true },
				optimizeDeps: { noDiscovery: true, include: [] },
				plugins: [solid({ compiler: 'native', ssr: true, solid: { hydratable: false } })],
				server: { middlewareMode: true, watch: null },
			});
			try {
				const styles = await discover(loader, (file) => this.addWatchFile(file));
				for (const id of new Set([
					...styles.sharedStyles,
					...Object.values(styles.pageStyles).flat(),
				])) {
					this.emitFile({ type: 'chunk', id: path.join(root, id) });
				}
			} finally {
				await loader.close();
			}
		},
		resolveId(id) {
			if (id === virtualId) return resolvedId;
		},
		async load(id) {
			if (id !== resolvedId) return;
			if (server == null)
				throw new Error('SSR style metadata is only available to the server host');
			return `export default ${JSON.stringify(await discover(server, (file) => this.addWatchFile(file)))}`;
		},
	};
}

if (import.meta.vitest != null) {
	test('discovers shared and per-page CSS without publishing server component JavaScript', async () => {
		await using fixture = await createFixture({
			'index.html': '<html><body>Fixture</body></html>',
			'layout.tsx': "import './layout.css'; export default () => null",
			'layout.css': '.shared-layout { color: red }',
			'pages/page.tsx': "import './home.css'; export default () => null",
			'pages/home.css': '.home-page { color: orange }',
			'pages/first/page.tsx':
				"import './Child'; import './first.css'; export const secret = 'server-only-sentinel'",
			'pages/first/Child.ts': "import './child.css'; export default () => null",
			'pages/first/child.css': '.nested-child { color: blue }',
			'pages/first/first.css': '.first-page { color: green }',
			'pages/second/page.tsx': "import './second.css'; export default () => null",
			'pages/second/second.css': '.second-page { color: purple }',
		});
		const server = await createServer({
			root: fixture.path,
			configFile: false,
			appType: 'custom',
			plugins: [ssrStylesPlugin({ pages: 'pages', layout: 'layout.tsx' })],
			optimizeDeps: { noDiscovery: true, include: [] },
			server: { middlewareMode: true, watch: null },
		});
		await using _cleanup = { [Symbol.asyncDispose]: () => server.close() };
		const { default: styles } = await server.ssrLoadModule(virtualId);
		expect(styles).toEqual({
			sharedStyles: ['/layout.css'],
			pageStyles: {
				'.': ['/pages/home.css'],
				first: ['/pages/first/child.css', '/pages/first/first.css'],
				second: ['/pages/second/second.css'],
			},
		});
		await build({
			root: fixture.path,
			configFile: false,
			logLevel: 'silent',
			plugins: [ssrStylesPlugin({ pages: 'pages', layout: 'layout.tsx' })],
			build: { manifest: true },
		});
		const manifest = JSON.parse(
			await readFile(fixture.getPath('dist/.vite/manifest.json'), 'utf8'),
		);
		expect(Object.keys(manifest).sort()).toEqual([
			'layout.css',
			'pages/first/child.css',
			'pages/first/first.css',
			'pages/home.css',
			'pages/second/second.css',
		]);
		const scripts = await glob('**/*.js', { cwd: fixture.getPath('dist'), absolute: true });
		const contents = await Promise.all(scripts.map((file) => readFile(file, 'utf8')));
		expect(contents.join('\n')).not.toContain('server-only-sentinel');
	});
}
