#!/usr/bin/env node

import process from 'node:process';
import { consola } from 'consola';
import * as d from 'date-fns';
import { $ } from 'dax-sh';
import matter from 'gray-matter';

const title = await consola.prompt(
	'Enter the title of the post',
	{
		type: 'text',
		required: true,
	},
);
if (!title) {
	consola.error('Title is required');
	process.exit(1);
}

const date = d.format(new Date(), 'yyyy-MM-dd');
const lang = await consola.prompt(
	'Enter the language of the post',
	{
		type: 'select',
		options: ['ja', 'en'],
		initial: 'ja',
	},
);

consola.start('Creating project...');

const blogDir = $.path(import.meta.dirname).join(`../src/contents/blog/`);
const location = $.path(blogDir).join(`${date}-${title.toLowerCase().replace(/ /g, '-')}.md`);
const frontMatter = matter.stringify('', {
	title,
	date,
	isPublished: false,
	lang,
});

await $`touch ${location}`;
await $`echo ${frontMatter} > ${location}`;
consola.success(`Post created at ${location}`);
