import type { MarkdownImport } from '../../../markdown';
import { filter, flatten, map, reduce } from '@core/iterutil/pipe';
import { pipe } from '@core/pipe';
import sortOn from 'sort-on';
import typia from 'typia';

type Metadata = {
	title: string;
	link: string;
	image: string;
	pubDate: string;
	featured?: boolean;
};

export type Project = Omit<Metadata, 'image' | 'featured'> & {
	featured: boolean;
	image: string;
	Content: MarkdownImport<unknown>['default'];
};

/** list of web projects */
export function getProjects(): Project[] {
	const projectsIter = pipe(
		/** import all markdown files in the directory */
		Object.entries(import.meta.glob('./*.md', { eager: true })) as Iterable<[string, MarkdownImport<Metadata>]>,

		/** get slug from the file path */
		map(([filepath, md]) => {
			const slug = filepath.split('/').at(-1)?.replace('.md', '');
			return {
				...md,
				slug,
			};
		}),

		/** filter out files without slug */
		filter(({ slug }) => slug != null),

		/** filter with valid metadata */
		filter(({ metadata }) => typia.is<Metadata>(metadata)),

		/** process each markdown file */
		map(({ metadata, default: Content }) => ({
			...metadata,
			featured: metadata?.featured ?? false,
			Content,
		} as const satisfies Project)),

		/** separate featured and non-featured projects */
		reduce((acc, project) => {
			acc[project.featured ? 0 : 1].push(project);
			return acc;
		}, [[], []] as [Project[], Project[]]),

		/** sort projects by pubDate */
		map(projectGroups => sortOn(projectGroups, ['-pubDate'])),

		/** flatten the two iterables */
		flatten,
	);

	return Array.from(projectsIter);
}
