import type { SiteAssets } from '@/site/assets.ts';
import type { PostListItem } from '@/site/content.ts';
import type { GeneratedFile } from '@/site/generated-file.ts';
import { renderComponent, renderHtmlDocument } from '@/site/html.ts';
import BlogListPage from './page.tsx';

/**
 * Renders the blog index page.
 *
 * @param items - Local and external posts to list.
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated blog index page.
 */
export function createBlogListPageFile(items: PostListItem[], assets: SiteAssets): GeneratedFile {
	const sorted = items.toSorted((a, b) => b.pubDate.localeCompare(a.pubDate));
	return {
		path: 'blog/index.html',
		sourcePaths: [
			'src/site/content.ts',
			'src/site/pages/blog',
			'src/content/blog',
			'src/contents/external-rss/rss.json',
			'src/contents/external-rss/posts.json',
		],
		content: renderHtmlDocument({
			title: 'Blog',
			pathname: '/blog/',
			content: renderComponent(BlogListPage, { items: sorted }),
			description:
				'Technical articles by @ryoppippi about software engineering, developer tooling, open source, and AI.',
			assets,
			style: 'blog',
		}),
	};
}
