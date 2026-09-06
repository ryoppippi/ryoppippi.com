import type { BlogPost } from '../pages/blog/data.ts';
import type { ShowcaseProject } from '../pages/works/showcase/data.ts';

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
