import sortOn from 'sort-on';
import typia from 'typia';
import { joinURL } from 'ufo';
import { parseMarkdown } from '$lib/markdown.server';
import { slugger } from '$lib/util';

type Metadata = {
	title: string;
	link: string;
	image: string;
	pubDate: string;
	featured?: boolean;
};

export type Project = Omit<Metadata, 'image'> & {
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
				image: metadata.image.startsWith('http') ? metadata.image : joinURL('/contents/projects/showcase', metadata.image),
				slug: slugger.slug(slug),
				content,
			} as const satisfies Project;
			return project;
		}
		catch (e) {
			console.error(`Error parsing ${filepath}:`);
			throw e;
		}
	})).then(ps => ps.filter(p => p != null));
	const sortedProject = sortOn(projects, ['-pubDate']);

	/** populate the featured projects and sort them */
	const featuredProjects = sortedProject.filter(p => p.featured);
	// eslint-disable-next-line ts/strict-boolean-expressions
	const otherProjects = sortedProject.filter(p => !p.featured);

	return [...featuredProjects, ...otherProjects];
}
