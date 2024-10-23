import type { Item, Metadata } from '$contents/blog/types';
import { dev } from '$app/environment';
import { filter, map } from '@core/iterutil/pipe';
import { pipe } from '@core/pipe';
import sortOn from 'sort-on';
import typia from 'typia';

export const blogPosts = sortOn(
	Array.from(
		pipe(
			Object.entries(import.meta.glob('$contents/blog/*.md', { eager: true })),

			map(([filepath, md]) => ({
				// eslint-disable-next-line ts/no-unsafe-member-access
				...typia.assert<Metadata>((md as any).metadata),
				filepath,
			})),

			/** filter out files without slug */
			filter(({ slug }) => slug != null),

			/** correct type */
			map(({ slug, ...v }) => ({ ...v, slug })),

			/** filter isPublished */
			filter(({ isPublished }) => dev || isPublished),
		),
	),
	['-pubDate'],
) satisfies Item[];
