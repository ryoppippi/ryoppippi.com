import type { CollectionAssetInput, CollectionAssetManifest } from '@ox-content/vite-plugin';
import { planCollectionAssets, rewriteCollectionAssetUrls } from '@ox-content/vite-plugin';
import path from 'node:path';
import { glob } from 'tinyglobby';
import { blogDirectory, showcaseDirectory } from '@/content/paths.ts';

const PUBLISHABLE_CONTENT_ASSET_EXTENSIONS = new Set([
	'.avif',
	'.gif',
	'.ico',
	'.jpeg',
	'.jpg',
	'.m4a',
	'.mp3',
	'.mp4',
	'.ogg',
	'.pdf',
	'.png',
	'.svg',
	'.wav',
	'.webm',
	'.webp',
]);

function publicUrl(...parts: string[]): string {
	return `/${parts
		.flatMap((part) => part.split('/'))
		.map(encodeURIComponent)
		.join('/')}`;
}

function isPublishableContentAsset(file: string): boolean {
	return PUBLISHABLE_CONTENT_ASSET_EXTENSIONS.has(path.extname(file).toLowerCase());
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
 * @param publishedPosts - Optional production allowlist; development can serve draft attachments.
 * @returns Explicit source-to-public mappings for Ox Content.
 */
export async function discoverSiteContentAssets(
	blogDir: string,
	showcaseDir: string,
	publishedPosts?: ReadonlySet<string>,
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
			.filter(isPublishableContentAsset)
			.filter((asset) => publishedPosts == null || publishedPosts.has(asset.split('/')[0]))
			.map((asset) => ({
				sourcePath: path.join(blogDir, asset),
				publicPath: publicUrl('blog', asset),
			})),
		...showcaseAssets.filter(isPublishableContentAsset).map((asset) => ({
			sourcePath: path.join(showcaseDir, asset),
			publicPath: publicUrl('works', 'showcase', 'assets', asset),
		})),
	];
}

/**
 * Plans the site's content-addressed asset targets and legacy public aliases.
 *
 * @param root - Vite project root containing every asset source.
 * @param publishedPosts - Published article filenames allowed to expose attachments.
 * @returns An Ox Content manifest shared by build and development serving.
 */
export async function planSiteContentAssets(
	root: string,
	publishedPosts?: ReadonlySet<string>,
): Promise<CollectionAssetManifest> {
	return planCollectionAssets({
		root,
		assets: await discoverSiteContentAssets(blogDirectory(), showcaseDirectory(), publishedPosts),
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
		return isPublishableContentAsset(file);
	}
	if (isWithin(showcaseDirectory(), file)) {
		return isPublishableContentAsset(file);
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

if (import.meta.vitest != null) {
	describe(discoverSiteContentAssets, () => {
		it('excludes attachments of posts outside the production publication allowlist', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'blog/published/image.png': 'public',
				'blog/draft/image.png': 'private',
				'blog/missing-publication/image.png': 'private',
				'showcase/cover.png': 'public',
			});
			const assets = await discoverSiteContentAssets(
				fixture.getPath('blog'),
				fixture.getPath('showcase'),
				new Set(['published']),
			);
			expect(assets.map(({ publicPath }) => publicPath)).toEqual([
				'/blog/published/image.png',
				'/works/showcase/assets/cover.png',
			]);
		});
		it('lists non-Markdown assets with encoded public aliases', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'blog/post/index.md': '# Post',
				'blog/post/index.html': '<p>Generated elsewhere</p>',
				'blog/post/component.mdx': '<Component />',
				'blog/post/component.tsx': 'export default () => null',
				'blog/post/data.json': '{"private":true}',
				'blog/post/styles.css': '.private {}',
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

	describe(rewriteCollectionAssetUrls, () => {
		const manifest = {
			assets: [
				{
					sourcePath: '/workspace/image.png',
					publicPaths: ['/blog/post/image.png'],
					contentPath: '/assets/content/digest.png',
				},
			],
		} satisfies CollectionAssetManifest;
		it('rewrites local asset attributes without changing external URLs', () => {
			const html =
				'<p><img src="./image.png" alt="local"><a href="https://example.com/image.png">external</a></p>';

			const rewritten = rewriteCollectionAssetUrls({
				html,
				pagePath: '/blog/post/',
				manifest,
			}).html;

			expect(rewritten).toContain('src="/assets/content/digest.png"');
			expect(rewritten).toContain('href="https://example.com/image.png"');
		});

		it('preserves query strings and fragments on rewritten asset URLs', () => {
			const rewritten = rewriteCollectionAssetUrls({
				html: '<img src="./image.png?width=800#preview">',
				pagePath: '/blog/post/',
				manifest,
			}).html;

			expect(rewritten).toContain('src="/assets/content/digest.png?width=800#preview"');
		});
	});
}
