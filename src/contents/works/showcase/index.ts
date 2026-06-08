import type { MarkdownImport } from '../../../markdown';
import { scope, type } from 'arktype';
import { sort } from 'fast-sort';

const images = import.meta.glob<string>('./*.{gif,heif,jpeg,jpg,png,tiff,webp}', {
	import: 'default',
	eager: true,
});

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
		'image': 'string',
		'Content': type('unknown').pipe(v => v as MarkdownImport<unknown>['default']),
	},
}).export();

/** list of web projects */
export function getProjects(): (typeof Project.inferOut)[] {
	const projects = Object.entries(import.meta.glob<MarkdownImport<typeof Metadata.infer>>('./*.md', { eager: true }))
		.map(([filepath, md]) => {
			const slug = filepath.split('/').at(-1)?.replace('.md', '');
			return {
				...md,
				slug,
			};
		})
		.filter(({ slug }) => slug != null)
		.filter(({ metadata }) => !(Metadata(metadata) instanceof type.errors))
		.map(({ metadata, default: Content }) => {
			const imagePath = metadata?.image;
			const relativeImagePath = imagePath != null ? `./${imagePath.split('/').at(-1)}` : undefined;
			const image = relativeImagePath != null ? images[relativeImagePath] : undefined;
			return Project.assert({
				...metadata,
				featured: metadata?.featured ?? false,
				image,
				Content,
			});
		});

	const projectGroups = projects.reduce((acc, project) => {
		acc[project.featured ? 0 : 1].push(project);
		return acc;
	}, [[], []] as [typeof Project.inferOut[], typeof Project.inferOut[]]);

	return projectGroups.flatMap(projectGroup => sort(projectGroup).desc(({ pubDate }) => pubDate));
}
