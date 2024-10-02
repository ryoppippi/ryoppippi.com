import typia from 'typia';
import sortOn from 'sort-on';
import { dev } from '$app/environment';
import type { Item, Metadata } from '$contents/blog/types';

export const blogPosts = sortOn(
	Object.entries(import.meta.glob('$contents/blog/*.md', { eager: true }))
		.map(([filepath, md]) => {
			const slug = filepath.split('/').at(-1)?.replace('.md', '');
			// eslint-disable-next-line ts/no-unsafe-member-access
			const metadata = typia.assert<Metadata>((md as any).metadata);
			if (slug == null) {
				return undefined;
			}

			try {
				if (dev || metadata.isPublished) {
					return typia.assert<Item>({
						...metadata,
						slug,
					});
				}
			}
			catch (e) {
				console.error(e);
			}
			return undefined;
		}).filter(p => p != null),
	['-pubDate'],
);
