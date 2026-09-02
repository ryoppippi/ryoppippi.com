import type { BlogPost } from './blog.ts';
import type { ShowcaseProject } from './showcase.ts';

/**
 * The rendered content passed from the root content build to site generation.
 *
 * @example
 * const artifact: ContentArtifact = { posts: [], showcase: [] };
 */
export type ContentArtifact = {
	posts: BlogPost[];
	showcase: ShowcaseProject[];
};
