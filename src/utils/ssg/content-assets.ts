import {
	planCollectionAssetsFromDocuments,
	type CollectionAssetManifest,
	type OxContentOptions,
} from '@ox-content/vite-plugin';
import { resolveSiteCollectionDocuments } from './collection-documents.ts';
import path from 'node:path';
import { createFixture } from 'fs-fixture';
import { OX_CONTENT_BUILD_OPTIONS } from '../../config/ox-content.ts';

/**
 * Publishes only selected documents' references and explicitly declared showcase covers.
 * @param root - Vite project root.
 * @param command - Development allows draft previews; builds require explicit publication.
 * @param oxContent - Configured collections, or isolated fixture collections in tests.
 * @returns The shared content-addressed asset plan and legacy page aliases.
 */
export async function planSiteContentAssets(
	root: string,
	command: 'build' | 'serve',
	oxContent: OxContentOptions = OX_CONTENT_BUILD_OPTIONS,
): Promise<CollectionAssetManifest> {
	const documents = await resolveSiteCollectionDocuments(
		{
			oxContent,
			collections: ['blog', 'showcase'],
			select: ({ collection, frontmatter }, context) =>
				collection === 'showcase' ||
				context.command === 'serve' ||
				frontmatter.isPublished === true,
		},
		{ root, command, mode: command === 'serve' ? 'development' : 'production' },
	);
	const result = await planCollectionAssetsFromDocuments({
		root: path.resolve(root, oxContent.srcDir ?? 'content'),
		documents: documents.map((document) => ({
			documentPath: document.documentPath,
			source: document.source,
			pagePath:
				document.collection === 'showcase'
					? '/works/showcase/assets/'
					: `/blog/${/^index\.mdx?$/.test(path.basename(document.documentPath)) ? path.basename(path.dirname(document.documentPath)) : path.basename(document.documentPath, path.extname(document.documentPath))}/`,
		})),
		extraAssets: documents.flatMap(({ collection, documentPath, frontmatter }) =>
			collection === 'showcase' && typeof frontmatter.image === 'string'
				? [
						{
							sourcePath: path.resolve(path.dirname(documentPath), frontmatter.image),
							publicPath: `/works/showcase/assets/${encodeURIComponent(path.basename(frontmatter.image))}`,
						},
					]
				: [],
		),
	});
	if (result.diagnostics.length > 0)
		throw new Error(result.diagnostics.map(({ message }) => message).join('\n'));
	return result.manifest;
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
	test.each([
		{
			command: 'build',
			expected: ['/blog/public/image%20one.png', '/works/showcase/assets/cover.png'],
		},
		{
			command: 'serve',
			expected: [
				'/blog/draft/image.png',
				'/blog/public/image%20one.png',
				'/blog/unspecified/image.png',
				'/works/showcase/assets/cover.png',
			],
		},
	] as const)('publishes only selected references in $command', async ({ command, expected }) => {
		await using fixture = await createFixture({
			'blog/public/index.md': '---\nisPublished: true\n---\n![image](./image%20one.png)',
			'blog/public/image one.png': 'public',
			'blog/public/unreferenced.png': 'not referenced',
			'blog/public/component.svelte': '<p>Private component</p>',
			'blog/public/data.json': '{"private":true}',
			'blog/draft/index.md': '---\nisPublished: false\n---\n![image](./image.png)',
			'blog/draft/image.png': 'draft',
			'blog/unspecified/index.md': '# Missing publication\n![image](./image.png)',
			'blog/unspecified/image.png': 'unspecified',
			'showcase/project/index.md': '---\nimage: ./cover.png\n---\nProject',
			'showcase/project/cover.png': 'cover',
		});
		const manifest = await planSiteContentAssets(fixture.path, command, {
			srcDir: '.',
			collections: {
				blog: { source: 'blog/*/index.md' },
				showcase: { source: 'showcase/*/index.md' },
			},
		});
		expect(manifest.assets.flatMap(({ publicPaths }) => publicPaths).sort()).toEqual(expected);
	});

	test('rejects a showcase cover outside the content root', async () => {
		await using fixture = await createFixture({
			'content/blog/post/index.md': '---\nisPublished: true\n---\nPost',
			'content/showcase/project/index.md': '---\nimage: ../../../private.png\n---\nProject',
			'private.png': 'not public content',
		});
		await expect(
			planSiteContentAssets(fixture.path, 'build', {
				srcDir: 'content',
				collections: {
					blog: { source: 'blog/*/index.md' },
					showcase: { source: 'showcase/*/index.md' },
				},
			}),
		).rejects.toThrow('must stay within root');
	});
}
