import { readContentArtifact, type ContentArtifact } from '@ryoppippi/content/artifact';
import type { SiteAssets } from '../src/site/assets.ts';
import { plugin } from 'bun';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { compile } from 'svelte/compiler';
import { inlineHomeStyles, resolveSiteAssets } from '../src/site/assets.ts';

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
	const manifest = JSON.parse(manifestSource) as Record<string, { css?: string[]; file: string }>;
	const assets = resolveSiteAssets(index, manifest);
	const baseFiles = manifest['index.html']?.css ?? [];
	const homeFile = manifest['src/site/styles/home.css']?.file;
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

plugin({
	name: 'svelte-server-components',
	setup(build) {
		build.onLoad({ filter: /\.svelte$/ }, async ({ path: filename }) => ({
			contents: compile(await Bun.file(filename).text(), {
				filename,
				generate: 'server',
			}).js.code,
			loader: 'js',
		}));
	},
});

const { generateSite } = (await import('../src/site/generate.ts')) as {
	generateSite: GenerateSite;
};
await generateSite({
	assets: await readSiteAssets(outDir),
	content: await readContentArtifact(path.join(root, 'packages/content/dist/content.json')),
	outDir,
	root,
});
