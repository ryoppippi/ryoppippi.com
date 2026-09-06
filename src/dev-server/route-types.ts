import type { BlogPost, BlogPostMetadata, ShowcaseProject } from '@/content/index.ts';
import type { PostListItem } from '@/contents/external-content.ts';
import type { OssProject, Talk } from '@/contents/works-data.ts';
import type { SiteAssets } from '@/rendering/site-assets.ts';

/** Publication groups consumed by the publications page. */
export type Publications = Record<
	string,
	Array<{ title: string; link: string; authors: string; publisher: string }>
>;

/** Lazy data and rendering dependencies available to a development route. */
export type DevRouteDependencies = {
	assets: SiteAssets;
	loadBlogPost: (slug: string) => Promise<BlogPost | null>;
	loadBlogPostMetadata: () => Promise<BlogPostMetadata[]>;
	loadBlogPostSource: (slug: string) => Promise<string | null>;
	loadDotfiles: () => Promise<string>;
	loadExternalPosts: () => Promise<PostListItem[]>;
	loadExternalMedia: () => Promise<PostListItem[]>;
	loadOssProjects: () => Promise<OssProject[]>;
	loadPublications: () => Promise<Publications>;
	loadShowcase: () => Promise<ShowcaseProject[]>;
	loadTalks: () => Promise<Talk[]>;
};

/** A response returned by a file-based development route. */
export type DevRouteResponse = {
	body: string;
	contentType: string;
	status: number;
};

/** Data used to expand dynamic route parameters into exact development URLs. */
export type DevRouteCatalogue = {
	posts: readonly BlogPostMetadata[];
	dotfiles: string;
};

/** Parameters captured from bracketed segments in a route filename. */
export type DevRouteParameters = Readonly<Record<string, string>>;

/** Context passed to a file-based route renderer. */
export type DevRouteRenderContext = {
	dependencies: DevRouteDependencies;
	params: DevRouteParameters;
};

/** Contract implemented by each file-based route module. */
export type DevFileRouteModule = {
	entries?: (catalogue: DevRouteCatalogue) => readonly DevRouteParameters[];
	render: (context: DevRouteRenderContext) => Promise<DevRouteResponse | null>;
};

/** An exact route produced from a route module and optional dynamic entries. */
export type DevFileRoute = {
	moduleId: string;
	params: DevRouteParameters;
	path: string;
};

/** HTML response content type used by page routes. */
export const HTML_CONTENT_TYPE = 'text/html; charset=utf-8';

/** Markdown response content type used by source routes. */
export const MARKDOWN_CONTENT_TYPE = 'text/markdown; charset=utf-8';

/** Plain-text response content type used by command routes. */
export const TEXT_CONTENT_TYPE = 'text/plain; charset=utf-8';

/**
 * Creates a development route response.
 *
 * @param body - Response body.
 * @param contentType - HTTP content type.
 * @param status - HTTP status code.
 * @returns The normalized development response.
 */
export function createDevRouteResponse(
	body: string,
	contentType = HTML_CONTENT_TYPE,
	status = 200,
): DevRouteResponse {
	return { body, contentType, status };
}
