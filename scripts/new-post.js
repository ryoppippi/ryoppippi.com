#!/usr/bin/env node

import { join } from 'node:path';
import process from 'node:process';
import { consola } from 'consola';
import * as d from 'date-fns';
import fs from 'fs-extra';
import matter from 'gray-matter';
import openEditor from 'open-editor';

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
		initial: 'en',
	},
);

consola.start('Creating project...');

const blogDir = join(import.meta.dirname, '..', 'src', 'contents', 'blog');
const md = join(
	blogDir,
	`${date}-${title.toLowerCase().replace(/ /g, '-')}.md`,
);
const frontMatter = matter.stringify('', {
	title,
	date,
	isPublished: false,
	lang,
});

await fs.ensureFile(md);
await fs.writeFile(md, frontMatter);

consola.success(`Post created at ${md}`);

const isOpen = await consola.prompt(
	'Do you want to open the editor?',
	{
		type: 'confirm',
		initial: true,
	},
);
if (isOpen) {
	openEditor([{ file: md }]);
}
