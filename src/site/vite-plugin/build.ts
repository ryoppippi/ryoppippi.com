import type { ContentArtifact } from '../../content/artifact.ts';
import type { IslandRenderer } from '../../content/markdown/render.ts';
import type { ManifestChunk, SiteAssets } from '../assets.ts';
import type { Plugin, ResolvedConfig } from 'vite';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { inlineHomeStyles, resolveSiteAssets } from '../assets.ts';
import { createServer } from 'vite';

type GenerateSite = (options: {
	assets: SiteAssets;
	content: ContentArtifact;
	outDir: string;
	root: string;
}) => Promise<void>;

function manifestCssFiles(manifest: Record<string, ManifestChunk>, source: string): string[] {
	const chunk = manifest[source];
	return chunk?.css ?? (chunk?.file.endsWith('.css') === true ? [chunk.file] : []);
}

async function readBuiltSiteAssets(outDir: string): Promise<SiteAssets> {
	const [index, manifestSource] = await Promise.all([
		readFile(path.join(outDir, 'index.html'), 'utf8'),
		readFile(path.join(outDir, '.vite/manifest.json'), 'utf8'),
	]);
	const manifest = JSON.parse(manifestSource) as Record<string, ManifestChunk>;
	const assets = resolveSiteAssets(index, manifest);
	const baseFiles = [
		...manifestCssFiles(manifest, 'index.html'),
		...manifestCssFiles(manifest, 'src/site/components/SiteLayout/SiteLayout.module.css'),
	];
	const homeFiles = manifestCssFiles(manifest, 'src/site/pages/home/Home.module.css');
	if (baseFiles.length === 0 || homeFiles.length === 0) {
		throw new Error('Missing CSS assets for inline home styles');
	}
	const readCssFiles = (files: readonly string[]) =>
		Promise.all(files.map((file) => readFile(path.join(outDir, file), 'utf8'))).then((contents) =>
			contents.join('\n'),
		);
	const [base, home] = await Promise.all([
		readCssFiles([...new Set(baseFiles)]),
		readCssFiles(homeFiles),
	]);
	return inlineHomeStyles(assets, base, home);
}

async function generateStaticSiteFromBuildOutput(config: ResolvedConfig): Promise<void> {
	const root = config.root;
	const outDir = path.resolve(root, config.build.outDir);
	const server = await createServer({
		appType: 'custom',
		configFile: config.configFile ?? path.join(root, 'vite.config.ts'),
		optimizeDeps: { noDiscovery: true },
		server: { middlewareMode: true },
	});

	try {
		const { generateSite } = (await server.ssrLoadModule('/src/site/generate.ts')) as {
			generateSite: GenerateSite;
		};
		const { buildContentArtifact } = (await server.ssrLoadModule('/src/content/build.ts')) as {
			buildContentArtifact: (renderIsland?: IslandRenderer) => Promise<ContentArtifact>;
		};
		const { createIslandRenderer } = (await server.ssrLoadModule(
			'/src/content/island-renderer.ts',
		)) as {
			createIslandRenderer: (load: (path: string) => Promise<unknown>) => IslandRenderer;
		};
		const content = await buildContentArtifact(
			createIslandRenderer((modulePath) => server.ssrLoadModule(modulePath)),
		);
		await generateSite({
			assets: await readBuiltSiteAssets(outDir),
			content,
			outDir,
			root,
		});
	} finally {
		await server.close();
	}
}

/**
 * Creates the build half of the static-site Vite integration.
 *
 * @returns The Vite plugin that generates final static output after the client build.
 */
export function staticSiteBuildPlugin(): Plugin {
	let config: ResolvedConfig | undefined;
	let generation: Promise<void> | undefined;

	return {
		name: 'ryoppippi-static-site-build',
		apply: (_config, { command, mode }) => command === 'build' && mode !== 'test',
		applyToEnvironment: (environment) => environment.name === 'client',
		configResolved(resolvedConfig) {
			config = resolvedConfig;
		},
		async closeBundle() {
			if (config == null) {
				throw new Error('Static-site build plugin was not configured');
			}
			generation ??= generateStaticSiteFromBuildOutput(config);
			await generation;
		},
	};
}
