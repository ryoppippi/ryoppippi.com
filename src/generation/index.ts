import type { ManifestChunk, SiteAssets } from '@/rendering/site-assets.ts';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { buildContentArtifact } from '@/content/build.ts';
import { createIslandRenderer } from '@/content/island-renderer.ts';
import { inlineHomeStyles, resolveSiteAssets } from '@/rendering/site-assets.ts';
import { generateStaticSite } from './generate-static-site.ts';

function manifestCssFiles(manifest: Record<string, ManifestChunk>, source: string): string[] {
	const chunk = manifest[source];
	return chunk?.css ?? (chunk?.file.endsWith('.css') === true ? [chunk.file] : []);
}

async function readBuiltSiteAssets(outDir: string): Promise<SiteAssets> {
	const manifestSource = await readFile(path.join(outDir, '.vite/manifest.json'), 'utf8');
	const manifest = JSON.parse(manifestSource) as Record<string, ManifestChunk>;
	const assets = resolveSiteAssets(manifest);
	const baseFiles = [
		...manifestCssFiles(manifest, 'index.html'),
		...manifestCssFiles(manifest, 'src/components/SiteLayout/SiteLayout.module.css'),
	];
	const homeFiles = manifestCssFiles(manifest, 'src/pages/home/Home.module.css');
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

/**
 * Builds the custom static site after Vite finishes its client output.
 *
 * @param options - Build directories and a Vite-backed loader for Solid island modules.
 * @returns A promise that resolves when every static output has been written.
 */
export async function buildStaticSite(options: {
	loadModule: (modulePath: string) => Promise<unknown>;
	outDir: string;
	root: string;
}): Promise<void> {
	const content = await buildContentArtifact(createIslandRenderer(options.loadModule));
	await generateStaticSite({
		assets: await readBuiltSiteAssets(options.outDir),
		content,
		outDir: options.outDir,
		root: options.root,
	});
}
