import type { SiteAssets } from '@/components/SiteLayout/assets.ts';
import type { PostListItem } from '@/lib/post-list.ts';
import { definePage } from '@/components/SiteLayout/page.ts';
import BlogList from './BlogList.svelte';
import type { PageRoutes } from '@/utils/ssg/route.ts';
import { loadExternalPosts, postListItems } from './external.ts';

/** Blog index; feeds are emitted by Ox Content in development and production. */
export const routes = (() => [
	{
		path: '/blog/',
		render: async ({ root, assets, loadBlogPostMetadata }) => {
			const [posts, externalPosts] = await Promise.all([
				loadBlogPostMetadata(),
				loadExternalPosts(root),
			]);
			return createBlogListPageFile(
				[...externalPosts, ...postListItems(posts, { includeDrafts: true })],
				assets,
			);
		},
	},
]) satisfies PageRoutes;

/**
 * Renders the blog index page.
 *
 * @param items - Local and external posts to list.
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated blog index page.
 */
export function createBlogListPageFile(items: PostListItem[], assets: SiteAssets) {
	const sorted = items.toSorted((a, b) => b.pubDate.localeCompare(a.pubDate));
	return definePage({
		component: BlogList,
		componentProps: { items: sorted },
		outputPath: 'blog/index.html',
		sourcePaths: [
			'src/pages/blog/external.ts',
			'src/pages/blog',
			'src/content/blog',
			'src/content/blog/external/rss.json',
			'src/content/blog/external/posts.json',
		],
		title: 'blog',
		pathname: '/blog/',
		description:
			'Technical articles by @ryoppippi about software engineering, developer tooling, open source, and AI.',
		assets,
		pageModule: '/src/pages/blog/BlogList.svelte',
		style: 'blog',
	});
}
