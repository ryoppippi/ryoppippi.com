import { fileURLToPath } from 'node:url';
import typia from 'typia';
import { parseMarkdown } from '$lib/markdown.server';

type Metadata = {
	title: string;
	link: string;
	image: string;
	pubDate: string;
};

type Project = Omit<Metadata, 'image'> & {
	slug: string;
	image: string;
	content: string;
};

/** list of web projects */
export async function getProjects(): Promise<Project[]> {
	const originals = import.meta.glob('./*.md', { eager: true, as: 'raw' });
	const projects = await Promise.all(Object.entries(originals).map(async ([filepath, mdRaw]) => {
		const slug = filepath.split('/').at(-1)?.replace('.md', '');
		if (slug == null) {
			return;
		}
		try {
			const { content, ...metadata } = await parseMarkdown(mdRaw);
			typia.assertGuard<Metadata>(metadata);
			const project = {
				...metadata,
				image: metadata.image.startsWith('http') ? metadata.image : fileURLToPath(new URL(metadata.image, import.meta.url)),
				slug,
				content,
			} as const satisfies Project;
			return project;
		}
		catch (e) {
			console.error(`Error parsing ${filepath}:`);
			throw e;
		}
	})).then(ps => ps.filter(p => p != null));
	return projects;
}
