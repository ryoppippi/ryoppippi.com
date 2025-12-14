import type { MarkdownImport } from '../../../markdown';
import { filter, flatten, map, reduce } from '@core/iterutil/pipe';
import { pipe } from '@core/pipe';
import { scope, type } from 'arktype';
import { sort } from 'fast-sort';

export const { Project, Metadata } = scope({
	Metadata: {
		'title': 'string',
		'slug': 'string',
		'link': 'string',
		'image': 'string',
		'pubDate': 'string',
		'featured?': 'boolean',
	},
	Project: {
		'...': 'Required<Metadata>',
		'Content': type('unknown').pipe(v => v as MarkdownImport<unknown>['default']),
	},
}).export();

/** list of web projects */
export function getProjects(): (typeof Project.inferOut)[] {
	const projectsIter = pipe(
		/** import all markdown files in the directory */
		Object.entries(import.meta.glob('./*.md', { eager: true })) as Iterable<[string, MarkdownImport<typeof Metadata.infer>]>,

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
		filter(({ metadata }) => !(Metadata(metadata) instanceof type.errors)),

		/** process each markdown file */
		map(({ metadata, default: Content }) => (Project.assert({
			...metadata,
			featured: metadata?.featured ?? false,
			Content,
		}))),

		/** separate featured and non-featured projects */
		reduce((acc, project) => {
			acc[project.featured ? 0 : 1].push(project);
			return acc;
		}, [[], []] as [typeof Project.inferOut[], typeof Project.inferOut[]]),

		/** sort projects by pubDate */
		map(projectGroups => sort(projectGroups).desc(({ pubDate }) => pubDate)),

		/** flatten the two iterables */
		flatten,
	);

	return Array.from(projectsIter);
}
