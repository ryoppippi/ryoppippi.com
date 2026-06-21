import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'tinyglobby';
import { loadBlogPosts, loadExternalPosts } from '../src/site/content.ts';
import { corePages } from '../src/site/pages.ts';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'build-static');

async function assetTags(): Promise<string> {
	const index = await readFile(path.join(outDir, 'index.html'), 'utf8');
	return [
		...index.matchAll(/<link[^>]*rel="stylesheet"[^>]*>/g),
		...index.matchAll(/<script[^>]*type="module"[^>]*><\/script>/g),
	].map(match => match[0]).join('\n\t');
}

async function copyContentAssets(): Promise<void> {
	const assets = await glob(['**/*', '!**/*.md'], { cwd: path.join(root, 'src/contents/blog'), onlyFiles: true });
	await Promise.all(assets.map(async (asset) => {
		const parts = asset.split('/');
		if (parts.length < 2) {
			return;
		}
		const destination = path.join(outDir, 'blog', parts[0], ...parts.slice(1));
		await mkdir(path.dirname(destination), { recursive: true });
		await cp(path.join(root, 'src/contents/blog', asset), destination);
	}));
}

const [posts, externalPosts, assets] = await Promise.all([
	loadBlogPosts(root),
	loadExternalPosts(root),
	assetTags(),
]);

for (const file of corePages(posts, externalPosts, assets)) {
	const destination = path.join(outDir, file.path);
	await mkdir(path.dirname(destination), { recursive: true });
	await writeFile(destination, file.content);
}

await copyContentAssets();
