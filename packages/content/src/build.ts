import type { TweetRenderer } from './markdown/render.ts';
import type { ContentArtifact } from './artifact.ts';
import { loadBlogPosts } from './blog.ts';
import { createMarkdownRenderer } from './markdown-cache.ts';
import { loadShowcase } from './showcase.ts';

export async function buildContentArtifact(renderTweet: TweetRenderer): Promise<ContentArtifact> {
	const renderContent = createMarkdownRenderer(renderTweet);
	const [posts, showcase] = await Promise.all([
		loadBlogPosts(renderContent),
		loadShowcase(renderContent),
	]);
	return { posts, showcase };
}
