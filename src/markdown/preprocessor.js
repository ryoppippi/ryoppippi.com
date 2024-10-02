import { parse as dateParse } from 'date-fns';
import rt from 'reading-time';
import MagicString from 'magic-string';
import matter from 'gray-matter';

/**
 * @param {string} content
 * @param {Record<string, any>} data
 */
function processMeta(content, data) {
	const { date, ...metadataRest } = data;
	const pubDate = date instanceof Date
		? date.toJSON()
		: typeof date === 'string'
			? dateParse(date, 'yyyy-MM-dd', new Date()).toJSON()
			: undefined;
	const readingTime = rt(content);

	return {
		...metadataRest,
		pubDate,
		readingTime,
	};
}

/**
 * @param md {import('markdown-it').default}
 */
function svelteMarkdown(md) {
	return {
		name: 'svelte-markdown',
		/**
		 * @param {object} options
		 * @param {string} options.content
		 * @param {string} options.filename
		 */
		markup: ({ content, filename }) => {
			if (!filename.endsWith('.md')) {
				return;
			}

			const {
				data,
				content: htmlWithoutMeta,
			} = matter(content);

			const processed = md.render(htmlWithoutMeta);

			const s = new MagicString(processed);

			/** replace <code ~ </code> -> {@html "<code ~ </code>"} */
			s.replaceAll(/<code[\s\S]*?<\/code>/g, (match) => {
				return `{@html ${JSON.stringify(match)}}`;
			});

			const meta = processMeta(htmlWithoutMeta, data);

			s.prepend(`
<script module>
  export const metadata = ${JSON.stringify(meta)};
</script>

`);
			return {
				code: s.toString(),
			};
		},
	};
}

export default svelteMarkdown;
