import type { SiteAssets } from '@/components/SiteLayout/assets.ts';
import type { PostListItem } from '@/pages/post-list.ts';
import { definePage } from '@/pages/page.ts';
import BlogListPage from './page.tsx';
import type { PageRoutes } from '../route.ts';
import { postListItems } from './external.ts';
import { blogFeedRoute } from './feed.ts';

/** Blog page and development feed; production feeds are emitted by Ox Content. */
export const routes = (() => [
	{
		path: '/blog/',
		render: async ({ assets, loadBlogPostMetadata, loadExternalPosts }) => {
			const [posts, externalPosts] = await Promise.all([
				loadBlogPostMetadata(),
				loadExternalPosts(),
			]);
			return createBlogListPageFile(
				[...externalPosts, ...postListItems(posts, { includeDrafts: true })],
				assets,
			);
		},
	},
	blogFeedRoute,
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
		component: BlogListPage,
		componentProps: { items: sorted },
		outputPath: 'blog/index.html',
		sourcePaths: [
			'src/pages/blog/external.ts',
			'src/pages/blog',
			'src/content/blog',
			'src/content/blog/external/rss.json',
			'src/content/blog/external/posts.json',
		],
		title: 'Blog',
		pathname: '/blog/',
		description:
			'Technical articles by @ryoppippi about software engineering, developer tooling, open source, and AI.',
		assets,
		style: 'blog',
	});
}
