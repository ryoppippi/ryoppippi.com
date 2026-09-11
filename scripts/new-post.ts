#!/usr/bin/env node

import { join } from 'node:path';
import process from 'node:process';
import * as p from '@clack/prompts';
import * as d from 'date-fns';
import fs from 'fs-extra';
import { stringify } from 'gray-matter-es';
import openEditor from 'open-editor';
import { BLOG_DIRECTORY, blogPermalink } from '../src/config/content.ts';

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
	options: [{ value: 'ja' }, { value: 'en' }],
	initialValue: 'en',
});
if (p.isCancel(lang)) {
	p.log.error('Language is required');
	process.exit(1);
}

// Hatena Bookmark comments are hidden site-wide; only a post that asks for them opts in.
const hatenaBookmarkComments = await p.confirm({
	message: 'Allow Hatena Bookmark comments on this post?',
	initialValue: false,
});
if (p.isCancel(hatenaBookmarkComments)) {
	p.log.error('Hatena Bookmark comment choice is required');
	process.exit(1);
}

p.log.message('Creating post...');

const blogDir = BLOG_DIRECTORY;
const slug = `${date}-${title.toLowerCase().replace(/ /g, '-')}-${lang}`;
const postDir = join(blogDir, slug);
const mdx = join(postDir, 'index.mdx');
const frontMatter = stringify('', {
	permalink: blogPermalink(slug),
	title,
	date,
	isPublished: false,
	lang,
	...(hatenaBookmarkComments ? { hatenaBookmarkComments: true } : {}),
});

await fs.ensureDir(postDir);
await fs.writeFile(mdx, frontMatter);

p.log.success(`Post created at ${mdx}`);

const isOpen = await p.confirm({
	message: 'Do you want to open the editor?',
	initialValue: true,
});
if (isOpen === true) {
	await openEditor([{ file: mdx }]);
}

p.outro('Done!');
