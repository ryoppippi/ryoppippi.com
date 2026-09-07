import { readFile } from 'node:fs/promises';
import process from 'node:process';
import path from 'node:path';
import { toExternalPost, type ExternalPostInput, type PostListItem } from '@/lib/post-list.ts';

/**
 * Loads curated podcasts and videos for the media page.
 *
 * @param root - Repository root containing the media configuration.
 * @returns Media entries for the media page.
 */
export async function loadExternalMedia(root = process.cwd()): Promise<PostListItem[]> {
	const source = await readFile(path.join(root, 'src/content/works/media/list.json'), 'utf8');
	const configuredMedia = JSON.parse(source) as ExternalPostInput[];
	const mediaPosts = configuredMedia.flatMap((item) => {
		const post = toExternalPost(item, 'podcast');
		return post == null ? [] : [post];
	});
	return mediaPosts;
}
