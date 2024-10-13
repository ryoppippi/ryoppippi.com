import { pipe } from '@core/pipe';
import { filter, map } from '@core/iterutil/pipe';
import typia from 'typia';
import sortOn from 'sort-on';
import { dev } from '$app/environment';
import type { Lang } from '$contents/types';

export type Metadata = {
	title: string;
	date: string;
	isPublished: boolean;
	lang: Lang;
};

export type Item = {
	slug: string;
} & Metadata;

export const blogPosts = sortOn(
	Array.from(
		pipe(
			Object.entries(import.meta.glob('$contents/blog/*.md', { eager: true })),

			map(([filepath, md]) => ({
				// eslint-disable-next-line ts/no-unsafe-member-access
				...typia.assert<Metadata>((md as any).metadata),
				slug: filepath.split('/').at(-1)?.replace('.md', ''),
			})),

			/** filter out files without slug */
			filter(({ slug }) => slug != null),

			/** correct type */
			map(({ slug, ...v }) => ({ ...v, slug })),

			/** filter isPublished */
			filter(({ isPublished }) => dev || isPublished),
		),
	),
	['-date'],
) satisfies Item[];
