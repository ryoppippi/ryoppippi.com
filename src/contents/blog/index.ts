import type { Item } from '$contents/blog/types';
import { dev } from '$app/environment';
import { $ } from 'dax-sh';
import matter from 'gray-matter';
import sortOn from 'sort-on';
import { glob } from 'tinyglobby';
import { processMeta } from '../../markdown/preprocessor';

// eslint-disable-next-line antfu/no-top-level-await
export const blogPosts = await (async () => {
	const blogDir = $.path(import.meta.dirname).join(`.`);
	// eslint-disable-next-line ts/restrict-template-expressions
	const blogs = await glob(`${blogDir}/*.md`);

	const frontMatters: Item[] = [];

	for (const filepath of blogs) {
		const text = await $`cat ${filepath}`.text();
		const { data } = matter(text);
		// eslint-disable-next-line ts/no-unsafe-assignment, ts/no-unsafe-call
		const metadata = processMeta(filepath, '', data);
		frontMatters.push(metadata as unknown as Item);
	}

	return sortOn(
		frontMatters.filter(({ isPublished }) => dev || isPublished),
		['-pubDate'],
	);
})();
