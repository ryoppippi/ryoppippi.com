import { dirname, join } from 'node:path';
import { map } from '@core/iterutil/pipe';
import { pipe } from '@core/pipe';
import { parse as dateParse } from 'date-fns';
import matter from 'gray-matter';
import MagicString from 'magic-string';
import rt from 'reading-time';
import { slugify } from '../lib/slugify.server.js';

/**
 * @param {string} filepath
 * @param {string} content
 * @param {Record<string, any>} data
 */
export function processMeta(filepath, content, data) {
	const { date, ...metadataRest } = data;
	const pubDate = date instanceof Date
		? date.toJSON()
		: typeof date === 'string'
			? dateParse(date, 'yyyy-MM-dd', new Date()).toJSON()
			: undefined;
	const readingTime = rt(content);

	/** if value is string and start with './' or '../', it's a path */
	for (const key in metadataRest) {
		if (typeof metadataRest[key] === 'string') {
			if (metadataRest[key].startsWith('./') || metadataRest[key].startsWith('../')) {
				metadataRest[key] = join(dirname(filepath), metadataRest[key]);
			}
		}
	}
	const filename = filepath.split('/').at(-1)?.replace('.md', '');
	if (filename == null) {
		throw new Error(`slug is not found in ${filename}`);
	}

	return {
		...metadataRest,
		pubDate,
		readingTime,
		filename,
		filepath,
		slug: slugify(filename),
	};
}

/**
 * Escape curly braces inside <code> tags for Svelte compatibility
 * @param {string} html
 */
function escapeCodeBraces(html) {
	return html.replace(/<code([^>]*)>([\s\S]*?)<\/code>/g, (match, attrs, content) => {
		const escaped = content
			.replace(/\{/g, '&#123;')
			.replace(/\}/g, '&#125;');
		return `<code${attrs}>${escaped}</code>`;
	});
}

/**
 * @param {string} proceed
 */
function additionalProcessMd(proceed) {
	let result = Array.from(
		pipe(
			proceed.split('\n'),
			map((line) => {
				if (line.includes(`link-preview-widget`)) {
					/* remove <p>, </p> */
					line = line.replace(/<p>/g, '').replace(/<\/p>/g, '');
					return line;
				}
				return line;
			}),
		),
	).join('\n');

	// Escape curly braces in <code> tags
	result = escapeCodeBraces(result);

	return result;
}

/**
 * @param md {import('markdown-exit').MarkdownExit}
 * @returns {import('svelte/types/compiler/preprocess').PreprocessorGroup} preprocessor
 */
function svelteMarkdown(md) {
	return {
		name: 'svelte-markdown',
		markup: ({ content, filename }) => {
			if (filename == null || !filename.endsWith('.md')) {
				return { code: content };
			}

			const {
				data,
				content: htmlWithoutMeta,
			} = matter(content);

			const processed = additionalProcessMd(md.render(htmlWithoutMeta));

			const s = new MagicString(processed);

			const meta = processMeta(filename, htmlWithoutMeta, data);

			const metaExport = `export const metadata = ${JSON.stringify(meta)};`;
			if (s.toString().includes('<script module>')) {
				if (!s.toString().includes('const metadata')) {
					s.replace('<script module>', `<script module>\n${metaExport}`);
				}
			}
			else {
				s.prepend(`
<script module>
  export const metadata = ${JSON.stringify(meta)};
</script>
`);
			}
			return {
				code: s.toString(),
			};
		},
	};
}

export default svelteMarkdown;
