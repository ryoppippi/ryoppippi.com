#!/usr/bin/env node

import { join } from 'node:path';
import process from 'node:process';
import * as p from '@clack/prompts';
import * as d from 'date-fns';
import fs from 'fs-extra';
import matter from 'gray-matter-es';
import openEditor from 'open-editor';

p.intro('Create a new blog post');

const title = await p.text({
	message: 'Enter the title of the post',
});
if (p.isCancel(title)) {
	p.log.error('Title is required');
	process.exit(1);
}

const date = d.format(new Date(), 'yyyy-MM-dd');
const lang = await p.select({
	message: 'Select the language of the post',
	options: [
		{ value: 'ja' },
		{ value: 'en' },
	],
	initialValue: 'en',
});
if (p.isCancel(lang)) {
	p.log.error('Language is required');
	process.exit(1);
}

p.log.message('Creating post...');

const blogDir = join(import.meta.dirname, '..', 'src', 'contents', 'blog');
const slug = `${date}-${title.toLowerCase().replace(/ /g, '-')}`;
const postDir = join(blogDir, slug);
const md = join(postDir, 'index.md');
const frontMatter = matter.stringify('', {
	title,
	date,
	isPublished: false,
	lang,
});

await fs.ensureDir(postDir);
await fs.writeFile(md, frontMatter);

p.log.success(`Post created at ${md}`);

const isOpen = await p.confirm({
	message: 'Do you want to open the editor?',
	initialValue: true,
});
if (isOpen === true) {
	openEditor([{ file: md }]);
}

p.outro('Done!');
