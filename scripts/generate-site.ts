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

async function readSiteAssets(outDir: string): Promise<SiteAssets> {
	const [index, manifestSource] = await Promise.all([
		readFile(path.join(outDir, 'index.html'), 'utf8'),
		readFile(path.join(outDir, '.vite/manifest.json'), 'utf8'),
	]);
	const manifest = JSON.parse(manifestSource) as Record<string, ManifestChunk>;
	const assets = resolveSiteAssets(index, manifest);
	const baseFiles = manifest['index.html']?.css ?? [];
	const homeFile = manifest['src/site/pages/home/Home.module.css']?.file;
	if (baseFiles.length === 0 || homeFile == null) {
		throw new Error('Missing CSS assets for inline home styles');
	}
	const [base, home] = await Promise.all([
		Promise.all(baseFiles.map((file) => readFile(path.join(outDir, file), 'utf8'))).then((files) =>
			files.join('\n'),
		),
		readFile(path.join(outDir, homeFile), 'utf8'),
	]);
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
