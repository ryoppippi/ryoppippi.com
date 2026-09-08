import type { BlogPost, BlogPostMetadata } from '@/pages/blog/data.ts';
import type { ShowcaseProject } from '@/pages/works/showcase/data.ts';
import type { PostListItem } from '@/lib/post-list.ts';
import type { MaybePromise } from '@ox-content/vite-plugin/custom-host';
import type { SiteAssets } from '@/components/SiteLayout/assets.ts';
import type { MarkdownRenderer } from './markdown.ts';
import { loadBlogPost, loadBlogPostMetadata, loadBlogPostSource } from '@/pages/blog/data.ts';
import { loadExternalMedia } from '@/pages/works/media/data.ts';
import { loadShowcase } from '@/pages/works/showcase/data.ts';

/** Lazy page data supplied by either the development or prerendering host. */
export type PageContext = {
	root: string;
	assets: SiteAssets;
	loadBlogPost: (slug: string) => MaybePromise<BlogPost | null>;
	loadBlogPostMetadata: () => MaybePromise<BlogPostMetadata[]>;
	loadBlogPostSource: (slug: string) => MaybePromise<string | null>;
	loadExternalMedia: () => MaybePromise<PostListItem[]>;
	loadShowcase: () => MaybePromise<ShowcaseProject[]>;
};

/** Source entries used to enumerate dynamic page outputs in either host. */
export type PageCatalogue = {
	posts: readonly BlogPostMetadata[];
	dotfiles: string;
};

/** Creates lazy site data loaders shared by the development and build hosts. */
export function createPageContext(
	root: string,
	assets: SiteAssets,
	renderContent: MarkdownRenderer,
): PageContext {
	return {
		root,
		assets,
		loadBlogPost: (slug) => loadBlogPost(slug, renderContent),
		loadBlogPostMetadata,
		loadBlogPostSource,
		loadExternalMedia: () => loadExternalMedia(root),
		loadShowcase: () => loadShowcase(renderContent),
	};
}
