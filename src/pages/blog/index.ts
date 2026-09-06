import type { SiteAssets } from '@/rendering/site-assets.ts';
import type { PostListItem } from '@/content/external-content.ts';
import { definePage } from '@/generation/define-page.ts';
import BlogListPage from './page.tsx';
import type { PageRoutes } from '../route.ts';
import { postListItems } from '@/content/external-content.ts';
import { renderBlogFeed } from './feed.ts';

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
	{
		path: '/feed.xml',
		devOnly: true,
		render: async ({ loadBlogPostMetadata }) => {
			const feed = await renderBlogFeed(await loadBlogPostMetadata());
			return { path: 'feed.xml', content: feed.content, contentType: feed.contentType };
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
		component: BlogListPage,
		componentProps: { items: sorted },
		outputPath: 'blog/index.html',
		sourcePaths: [
			'src/content/external-content.ts',
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
