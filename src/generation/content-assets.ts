import type { DefaultTreeAdapterMap } from 'parse5';
import type { CollectionAssetInput, CollectionAssetManifest } from '@ox-content/vite-plugin';
import { planCollectionAssets } from '@ox-content/vite-plugin';
import path from 'node:path';
import { parseFragment, serialize } from 'parse5';
import { glob } from 'tinyglobby';
import { blogDirectory, showcaseDirectory } from '@/content/paths.ts';

function publicUrl(...parts: string[]): string {
	return `/${parts
		.flatMap((part) => part.split('/'))
		.map(encodeURIComponent)
		.join('/')}`;
}

function isWithin(directory: string, file: string): boolean {
	const relative = path.relative(directory, file);
	return (
		relative !== '' &&
		relative !== '..' &&
		!relative.startsWith(`..${path.sep}`) &&
		!path.isAbsolute(relative)
	);
}

/**
 * Discovers non-Markdown assets and assigns the public aliases owned by this site.
 *
 * @param blogDir - Directory containing blog posts and their local assets.
 * @param showcaseDir - Directory containing showcase entries and images.
 * @returns Explicit source-to-public mappings for Ox Content.
 */
export async function discoverSiteContentAssets(
	blogDir: string,
	showcaseDir: string,
): Promise<CollectionAssetInput[]> {
	const [blogAssets, showcaseAssets] = await Promise.all([
		glob(['**/*', '!**/*.md', '!**/*.mdx', '!**/*.generated.json', '!**/index.html'], {
			cwd: blogDir,
			onlyFiles: true,
		}),
		glob(['**/*', '!**/*.md', '!**/*.mdx', '!**/index.ts'], {
			cwd: showcaseDir,
			onlyFiles: true,
		}),
	]);

	return [
		...blogAssets
			.filter((asset) => asset.includes('/'))
			.map((asset) => ({
				sourcePath: path.join(blogDir, asset),
				publicPath: publicUrl('blog', asset),
			})),
		...showcaseAssets.map((asset) => ({
			sourcePath: path.join(showcaseDir, asset),
			publicPath: publicUrl('works', 'showcase', 'assets', asset),
		})),
	];
}

/**
 * Plans the site's content-addressed asset targets and legacy public aliases.
 *
 * @param root - Vite project root containing every asset source.
 * @returns An Ox Content manifest shared by build and development serving.
 */
export async function planSiteContentAssets(root: string): Promise<CollectionAssetManifest> {
	return planCollectionAssets({
		root,
		assets: await discoverSiteContentAssets(blogDirectory(), showcaseDirectory()),
	});
}

/**
 * Reports whether a changed source requires the development asset manifest to be replanned.
 *
 * @param file - Absolute source path reported by Vite's watcher.
 * @returns Whether the path can affect the collection asset manifest.
 */
export function isSiteContentAssetSource(file: string): boolean {
	if (isWithin(blogDirectory(), file)) {
		return (
			!file.endsWith('.md') &&
			!file.endsWith('.mdx') &&
			!file.endsWith('.generated.json') &&
			path.basename(file) !== 'index.html'
		);
	}
	if (isWithin(showcaseDirectory(), file)) {
		return !file.endsWith('.md') && !file.endsWith('.mdx') && path.basename(file) !== 'index.ts';
	}
	return false;
}

/**
 * Maps every public alias to the content-addressed target emitted by Ox Content.
 *
 * @param manifest - Planned collection asset manifest.
 * @returns Public alias to content target mappings used while rendering HTML.
 */
export function collectionAssetUrls(
	manifest: CollectionAssetManifest,
): ReadonlyMap<string, string> {
	const urls = new Map<string, string>();
	for (const asset of manifest.assets) {
		for (const publicPath of asset.publicPaths) {
			urls.set(publicPath, asset.contentPath);
		}
	}
	return urls;
}

/**
 * Rewrites local asset attributes to their content-addressed production URLs.
 *
 * @param html - Rendered HTML containing local asset references.
 * @param basePath - Public page path used to resolve relative references.
 * @param urls - Public alias to content target mappings.
 * @returns HTML with known local asset references rewritten.
 */
export function rewriteContentAssetUrls(
	html: string,
	basePath: string,
	urls: ReadonlyMap<string, string>,
): string {
	const origin = new URL('https://content.invalid');
	const base = new URL(basePath, origin);
	const fragment = parseFragment(html);

	function visit(node: DefaultTreeAdapterMap['node']): void {
		if ('attrs' in node) {
			for (const attribute of node.attrs) {
				if (!['href', 'poster', 'src'].includes(attribute.name)) {
					continue;
				}
				const resolved = new URL(attribute.value, base);
				if (resolved.origin !== origin.origin) {
					continue;
				}
				const replacement = urls.get(resolved.pathname);
				if (replacement != null) {
					attribute.value = `${replacement}${resolved.search}${resolved.hash}`;
				}
			}
		}
		if ('childNodes' in node) {
			for (const child of node.childNodes) {
				visit(child);
			}
		}
	}

	visit(fragment);
	return serialize(fragment);
}

if (import.meta.vitest != null) {
	describe(discoverSiteContentAssets, () => {
		it('lists non-Markdown assets with encoded public aliases', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'blog/post/index.md': '# Post',
				'blog/post/index.html': '<p>Generated elsewhere</p>',
				'blog/post/component.mdx': '<Component />',
				'blog/post/image one.png': 'image',
				'showcase/project.md': '# Project',
				'showcase/project cover.jpg': 'cover',
				'showcase/index.ts': 'export {}',
			});

			expect(
				await discoverSiteContentAssets(fixture.getPath('blog'), fixture.getPath('showcase')),
			).toEqual([
				{
					sourcePath: fixture.getPath('blog/post/image one.png'),
					publicPath: '/blog/post/image%20one.png',
				},
				{
					sourcePath: fixture.getPath('showcase/project cover.jpg'),
					publicPath: '/works/showcase/assets/project%20cover.jpg',
				},
			]);
		});
	});

	describe(collectionAssetUrls, () => {
		it('maps every alias to its content-addressed target', () => {
			const urls = collectionAssetUrls({
				assets: [
					{
						sourcePath: '/workspace/image.png',
						publicPaths: ['/blog/post/image.png', '/legacy/image.png'],
						contentPath: '/assets/content/digest.png',
					},
				],
			});

			expect([...urls]).toEqual([
				['/blog/post/image.png', '/assets/content/digest.png'],
				['/legacy/image.png', '/assets/content/digest.png'],
			]);
		});
	});

	describe(rewriteContentAssetUrls, () => {
		it('rewrites local asset attributes without changing external URLs', () => {
			const html =
				'<p><img src="./image.png" alt="local"><a href="https://example.com/image.png">external</a></p>';

			const rewritten = rewriteContentAssetUrls(
				html,
				'/blog/post/',
				new Map([['/blog/post/image.png', '/assets/content/digest.png']]),
			);

			expect(rewritten).toContain('src="/assets/content/digest.png"');
			expect(rewritten).toContain('href="https://example.com/image.png"');
		});

		it('preserves query strings and fragments on rewritten asset URLs', () => {
			const rewritten = rewriteContentAssetUrls(
				'<img src="./image.png?width=800#preview">',
				'/blog/post/',
				new Map([['/blog/post/image.png', '/assets/content/digest.png']]),
			);

			expect(rewritten).toContain('src="/assets/content/digest.png?width=800#preview"');
		});
	});
}
