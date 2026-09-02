import type { ContentArtifact } from '../src/content/artifact.ts';
import type { IslandRenderer } from '../src/content/markdown/render.ts';
import type { ManifestChunk, SiteAssets } from '../src/site/assets.ts';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { inlineHomeStyles, resolveSiteAssets } from '../src/site/assets.ts';
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

async function readSiteAssets(outDir: string): Promise<SiteAssets> {
	const [index, manifestSource] = await Promise.all([
		readFile(path.join(outDir, 'index.html'), 'utf8'),
		readFile(path.join(outDir, '.vite/manifest.json'), 'utf8'),
	]);
	const manifest = JSON.parse(manifestSource) as Record<string, ManifestChunk>;
	const assets = resolveSiteAssets(index, manifest);
	const baseFiles = [
		...manifestCssFiles(manifest, 'index.html'),
		...manifestCssFiles(manifest, 'src/site/components/Shell/Shell.module.css'),
	];
	const homeFiles = manifestCssFiles(manifest, 'src/site/pages/home/Home.module.css');
	if (baseFiles.length === 0 || homeFiles.length === 0) {
		throw new Error('Missing CSS assets for inline home styles');
	}
	const readCss = (files: readonly string[]) =>
		Promise.all(files.map((file) => readFile(path.join(outDir, file), 'utf8'))).then((contents) =>
			contents.join('\n'),
		);
	const [base, home] = await Promise.all([readCss([...new Set(baseFiles)]), readCss(homeFiles)]);
	return inlineHomeStyles(assets, base, home);
}

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'build');

const server = await createServer({
	appType: 'custom',
	configFile: path.join(root, 'vite.config.ts'),
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
		assets: await readSiteAssets(outDir),
		content,
		outDir,
		root,
	});
} finally {
	await server.close();
}
