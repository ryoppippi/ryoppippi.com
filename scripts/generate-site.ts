import { readContentArtifact, type ContentArtifact } from '@ryoppippi/content/artifact';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';

type GenerateSite = (options: {
	assets: string;
	content: ContentArtifact;
	outDir: string;
	root: string;
}) => Promise<void>;

async function readAssetTags(outDir: string): Promise<string> {
	const [index, manifestSource] = await Promise.all([
		readFile(path.join(outDir, 'index.html'), 'utf8'),
		readFile(path.join(outDir, '.vite/manifest.json'), 'utf8'),
	]);
	const manifest = JSON.parse(manifestSource) as Record<string, { css?: string[] }>;
	// The SSG tweet needs its lazy chunk's CSS before hydration, but Vite omits it from index.html.
	const tweetStyles =
		Object.entries(manifest).find(([source]) => source.endsWith('/Tweet.svelte'))?.[1].css ?? [];
	const tags = [
		...index.matchAll(/<link[^>]*rel="stylesheet"[^>]*>/g),
		...index.matchAll(/<script[^>]*type="module"[^>]*><\/script>/g),
	].map((match) => match[0]);
	tags.push(...tweetStyles.map((href) => `<link rel="stylesheet" crossorigin href="/${href}">`));
	return tags.join('\n\t');
}

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'build');
const server = await createServer({
	appType: 'custom',
	configFile: false,
	logLevel: 'error',
	plugins: [svelte()],
	publicDir: false,
	server: { middlewareMode: true },
});

try {
	const { generateSite } = (await server.ssrLoadModule('/src/site/generate.ts')) as {
		generateSite: GenerateSite;
	};
	await generateSite({
		assets: await readAssetTags(outDir),
		content: await readContentArtifact(path.join(root, 'packages/content/dist/content.json')),
		outDir,
		root,
	});
} finally {
	await server.close();
}
