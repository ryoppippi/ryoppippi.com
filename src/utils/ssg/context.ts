import type { BlogPost, BlogPostMetadata } from '@/pages/blog/data.ts';
import type { ShowcaseProject } from '@/pages/works/showcase/data.ts';
import type { PostListItem } from '@/lib/post-list.ts';
import type { OssProject } from '@/pages/works/oss/data.ts';
import type { Talk } from '@/pages/works/talks/data.ts';
import type { SiteAssets } from '@/components/SiteLayout/assets.ts';
import type { MarkdownRenderer } from './markdown.ts';
import { loadBlogPost, loadBlogPostMetadata, loadBlogPostSource } from '@/pages/blog/data.ts';
import { loadExternalMedia } from '@/pages/works/media/data.ts';
import { loadExternalPosts } from '@/pages/blog/external.ts';
import { loadOssProjects } from '@/pages/works/oss/data.ts';
import { loadPublications } from '@/pages/works/publications/data.ts';
import { loadTalks } from '@/pages/works/talks/data.ts';
import { loadShowcase } from '@/pages/works/showcase/data.ts';

/** Lazy page data supplied by either the development or prerendering host. */
export type PageContext = {
	assets: SiteAssets;
	loadBlogPost: (slug: string) => Promise<BlogPost | null>;
	loadBlogPostMetadata: () => Promise<BlogPostMetadata[]>;
	loadBlogPostSource: (slug: string) => Promise<string | null>;
	loadExternalPosts: () => Promise<PostListItem[]>;
	loadExternalMedia: () => Promise<PostListItem[]>;
	loadOssProjects: () => Promise<OssProject[]>;
	loadPublications: () => ReturnType<typeof loadPublications>;
	loadShowcase: () => Promise<ShowcaseProject[]>;
	loadTalks: () => Promise<Talk[]>;
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
		assets,
		loadBlogPost: (slug) => loadBlogPost(slug, renderContent),
		loadBlogPostMetadata,
		loadBlogPostSource,
		loadExternalPosts: () => loadExternalPosts(root),
		loadExternalMedia: () => loadExternalMedia(root),
		loadOssProjects: () => loadOssProjects(root),
		loadPublications: () => loadPublications(root),
		loadShowcase: () => loadShowcase(renderContent),
		loadTalks,
	};
}
