import type { SiteAssets } from '@/rendering/site-assets.ts';
import type { PostListItem } from '@/contents/external-content.ts';
import { definePage } from '@/generation/define-page.ts';
import BlogListPage from './page.tsx';

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
			'src/contents/external-content.ts',
			'src/pages/blog',
			'src/content/blog',
			'src/contents/external-rss/rss.json',
			'src/contents/external-rss/posts.json',
		],
		title: 'Blog',
		pathname: '/blog/',
		description:
			'Technical articles by @ryoppippi about software engineering, developer tooling, open source, and AI.',
		assets,
		style: 'blog',
	});
}
