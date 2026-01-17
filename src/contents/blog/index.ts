import type { Item } from './types';
import { sort } from 'fast-sort';
import fs from 'fs-extra';
import matter from 'gray-matter-es';
import { isDevelopment } from 'std-env';
import { glob } from 'tinyglobby';
import { processMeta } from '../../markdown/preprocessor.ts';

const allBlogPosts = await (async () => {
	const blogDir = import.meta.dirname;

	// Support both flat .md files and slug/index.md directory structure
	const blogs = await glob([
		`${blogDir}/*.md`,
		`${blogDir}/*/index.md`,
	]);

	const frontMatters: Item[] = [];

	for (const filepath of blogs) {
		const text = await fs.readFile(filepath, 'utf-8');
		const { data } = matter(text);

		const metadata = processMeta(filepath, '', data);
		frontMatters.push(metadata as unknown as Item);
	}

	return sort(frontMatters).desc(({ pubDate }) => pubDate);
})();

export const blogPosts = allBlogPosts.filter(({ isPublished }) => isDevelopment || isPublished);

export const publishedBlogPosts = allBlogPosts.filter(({ isPublished }) => isPublished);
