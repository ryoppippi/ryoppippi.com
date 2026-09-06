import type { BlogPost, BlogPostMetadata, ShowcaseProject } from '@/content/index.ts';
import type { PostListItem } from '@/content/external-content.ts';
import type { loadPublications, OssProject, Talk } from '@/content/works-data.ts';
import type { SiteAssets } from '@/rendering/site-assets.ts';

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
