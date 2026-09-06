import type { ContentArtifact } from './content-types.ts';
import { loadBlogPosts } from '../pages/blog/data.ts';
import {
	renderMarkdown,
	type IslandRenderer,
	type MarkdownRenderer,
} from '../ox-content/markdown.ts';
import { loadShowcase } from '../pages/works/showcase/data.ts';

export async function buildContentArtifact(
	renderIsland?: IslandRenderer,
): Promise<ContentArtifact> {
	const renderContent: MarkdownRenderer = (content, options) =>
		renderMarkdown(content, { ...options, renderIsland });
	const [posts, showcase] = await Promise.all([
		loadBlogPosts(renderContent),
		loadShowcase(renderContent),
	]);
	return { posts, showcase };
}
