import sortOn from 'sort-on';
import { joinURL } from 'ufo';
import type { MarkdownImport } from '../../../markdown';
import { slugify } from '$lib/util';

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
	Content: MarkdownImport<unknown>['default'];
};

/** list of web projects */
export async function getProjects(): Promise<Project[]> {
	const originals = import.meta.glob('./*.md', { eager: true });
	const projects = await Promise.all(Object.entries(originals).map(async ([filepath, md]) => {
		const slug = filepath.split('/').at(-1)?.replace('.md', '');
		if (slug == null) {
			return;
		}
		try {
			const { metadata, default: Content } = md as MarkdownImport<Metadata>;
			const project = {
				...metadata,
				slug: slugify(slug),
				Content,
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
