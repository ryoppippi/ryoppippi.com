import { dirname, join } from 'node:path';
import { parse as dateParse } from 'date-fns';
import rt from 'reading-time';
import MagicString from 'magic-string';
import matter from 'gray-matter';

/**
 * @param {string} filename
 * @param {string} content
 * @param {Record<string, any>} data
 */
function processMeta(filename, content, data) {
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
				metadataRest[key] = join(dirname(filename), metadataRest[key]);
			}
		}
	}

	return {
		...metadataRest,
		pubDate,
		readingTime,
	};
}

/**
 * @param md {import('markdown-it').default}
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

			const processed = md.render(htmlWithoutMeta);

			const s = new MagicString(processed);

			const meta = processMeta(filename, htmlWithoutMeta, data);

			const metaExport = `export const metadata = ${JSON.stringify(meta)};`;
			if (s.toString().includes('<script module>')) {
				s.replace('<script module>', `<script module>\n${metaExport}`);
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
