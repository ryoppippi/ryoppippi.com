import type { ContentArtifact } from './artifact.ts';
import { loadBlogPosts } from './blog.ts';
import { renderMarkdown, type IslandRenderer, type MarkdownRenderer } from './markdown/render.ts';
import { loadShowcase } from './showcase.ts';

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
