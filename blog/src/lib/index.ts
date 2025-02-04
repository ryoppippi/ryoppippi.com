import type { Item, Metadata } from './types.js';
import { filter, map } from '@core/iterutil/pipe';
import { pipe } from '@core/pipe';
import { DEV as dev } from 'esm-env';
import sortOn from 'sort-on';
import typia from 'typia';

export const blogPosts = sortOn(
	Array.from(
		pipe(
			[
				// ...Object.entries(import.meta.glob('./*.md', { eager: true })),
				...Object.entries(import.meta.glob('./*.svelte', { eager: true })),
			],

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

export type * from './types.js';
