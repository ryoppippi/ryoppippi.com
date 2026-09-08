import { readFile } from 'node:fs/promises';
import path from 'node:path';

/** Loads the curated publication groups used by the publications page. */
export async function loadPublications(
	root: string,
): Promise<
	Record<string, Array<{ title: string; link: string; authors: string; publisher: string }>>
> {
	return JSON.parse(
		await readFile(path.join(root, 'src/content/works/publications/list.json'), 'utf8'),
	) as Record<string, Array<{ title: string; link: string; authors: string; publisher: string }>>;
}
