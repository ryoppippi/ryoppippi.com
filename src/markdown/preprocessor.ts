import type { PreprocessorGroup } from 'svelte/compiler';
import { dirname, join } from 'node:path';
import { map } from '@core/iterutil/pipe';
import { pipe } from '@core/pipe';
import { parse as dateParse } from 'date-fns';
import { matter } from 'gray-matter-es';
import MagicString from 'magic-string';
import rt from 'reading-time';
import { slugify } from '../lib/slugify.server.ts';

import { addExternalLinkAttributes } from './html.ts';
import { replaceMagicLinks } from './magic-link.ts';
import { renderMarkdown } from './render.ts';

type FootnoteDefinition = {
	key: string;
	content: string;
	id: string;
	index: number;
	firstReferenceId: string;
};

export function processMeta(
	filepath: string,
	content: string,
	data: Record<string, any>,
) {
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
	// Support both flat .md files and slug/index.md directory structure
	const pathParts = filepath.split('/');
	const lastPart = pathParts.at(-1);
	let filename;

	if (lastPart === 'index.md') {
		// Directory structure: slug/index.md - use directory name as slug
		filename = pathParts.at(-2);
	}
	else {
		// Flat structure: slug.md
		filename = lastPart?.replace('.md', '');
	}

	if (filename == null) {
		throw new Error(`slug is not found in ${filepath}`);
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
 */
function escapeCodeBraces(html: string) {
	return html.replace(/<code([^>]*)>([\s\S]*?)<\/code>/g, (_match, attrs: string, content: string) => {
		const escaped = content
			.replace(/\{/g, '&#123;')
			.replace(/\}/g, '&#125;');
		return `<code${attrs}>${escaped}</code>`;
	});
}

function additionalProcessMd(proceed: string): string {
	let result = Array.from(
		pipe(
			proceed.split('\n'),
			map((line) => {
				if (line.includes(`link-preview-widget`)) {
					line = line.replace(/<p\b[^>]*>/g, '').replace(/<\/p>/g, '');
					return line;
				}
				return line;
			}),
		),
	).join('\n');

	// Escape curly braces in <code> tags
	result = escapeCodeBraces(result);
	result = replaceMagicLinks(result);
	result = addExternalLinkAttributes(result);
	result = result.replace(/(<\/a>|<img\b[^>]*>)\{[^}\n]+\}/g, '$1');
	result = result.replace(
		/<p\b[^>]*>(\s*<[A-Z][\w.]*\b[^>]*(?:\/>|>[\s\S]*?<\/[A-Z][\w.]*>)\s*)<\/p>/g,
		'$1',
	);

	return result;
}

function isFenceLine(trimmed: string) {
	return trimmed.match(/^(`{3,}|~{3,})/)?.[1];
}

function isScriptOpen(trimmed: string) {
	return /^<script(?:\s|>)/.test(trimmed);
}

function isScriptClose(trimmed: string) {
	return trimmed === '</script>';
}

function normalizeFootnoteId(key: string, usedIds: Set<string>, index: number) {
	const slug = slugify(key).replace(/^_+/, '');
	const base = slug.length > 0 ? slug : `footnote-${index + 1}`;
	let id = base;
	let suffix = 2;

	while (usedIds.has(id)) {
		id = `${base}-${suffix}`;
		suffix += 1;
	}

	usedIds.add(id);
	return id;
}

function collectFootnotes(content: string) {
	const lines = content.split('\n');
	const output: string[] = [];
	const footnotes: FootnoteDefinition[] = [];
	const footnoteMap = new Map<string, FootnoteDefinition>();
	const usedIds = new Set<string>();

	let inFence = false;
	let fenceMarker = '';
	let inScript = false;

	for (let i = 0; i < lines.length; i += 1) {
		const line = lines[i];
		const trimmed = line.trimStart();
		const fence = isFenceLine(trimmed);

		if (inScript) {
			output.push(line);
			if (isScriptClose(trimmed)) {
				inScript = false;
			}
			continue;
		}

		if (isScriptOpen(trimmed)) {
			inScript = true;
			output.push(line);
			continue;
		}

		if (fence != null) {
			if (!inFence) {
				inFence = true;
				fenceMarker = fence;
			}
			else if (trimmed.startsWith(fenceMarker[0]) && fence.length >= fenceMarker.length) {
				inFence = false;
				fenceMarker = '';
			}

			output.push(line);
			continue;
		}

		if (inFence) {
			output.push(line);
			continue;
		}

		const definitionMatch = line.match(/^\[\^([^\]]+)\]:/);
		if (definitionMatch == null) {
			output.push(line);
			continue;
		}

		const key = definitionMatch[1];
		const definitionLines = [line.slice(definitionMatch[0].length).replace(/^[ \t]+/, '')];

		while (i + 1 < lines.length) {
			const nextLine = lines[i + 1];

			if (/^(?: {4}|\t)/.test(nextLine)) {
				definitionLines.push(nextLine.replace(/^(?: {4}|\t)/, ''));
				i += 1;
				continue;
			}

			if (nextLine === '' && i + 2 < lines.length && (/^(?: {4}|\t)/.test(lines[i + 2]) || lines[i + 2] === '')) {
				definitionLines.push('');
				i += 1;
				continue;
			}

			break;
		}

		const footnote: FootnoteDefinition = {
			key,
			content: definitionLines.join('\n').trim(),
			id: normalizeFootnoteId(key, usedIds, footnotes.length),
			index: footnotes.length + 1,
			firstReferenceId: `fnref-${footnotes.length + 1}`,
		};

		footnotes.push(footnote);
		footnoteMap.set(key, footnote);
	}

	return {
		content: output.join('\n'),
		footnotes,
		footnoteMap,
	};
}

function replaceFootnoteReferences(content: string, footnoteMap: Map<string, FootnoteDefinition>) {
	if (footnoteMap.size === 0) {
		return content;
	}

	const lines = content.split('\n');
	const output: string[] = [];
	const referenceCounts = new Map<string, number>();

	let inFence = false;
	let fenceMarker = '';
	let inScript = false;

	for (const line of lines) {
		const trimmed = line.trimStart();
		const fence = isFenceLine(trimmed);

		if (inScript) {
			output.push(line);
			if (isScriptClose(trimmed)) {
				inScript = false;
			}
			continue;
		}

		if (isScriptOpen(trimmed)) {
			inScript = true;
			output.push(line);
			continue;
		}

		if (fence != null) {
			if (!inFence) {
				inFence = true;
				fenceMarker = fence;
			}
			else if (trimmed.startsWith(fenceMarker[0]) && fence.length >= fenceMarker.length) {
				inFence = false;
				fenceMarker = '';
			}

			output.push(line);
			continue;
		}

		if (inFence) {
			output.push(line);
			continue;
		}

		const segments = line.split(/(`[^`]*`)/);
		const replaced = segments.map((segment, index) => {
			if (index % 2 === 1) {
				return segment;
			}

			return segment.replace(/\[\^([^\]]+)\]/g, (_match, key: string) => {
				const footnote = footnoteMap.get(key);
				if (footnote == null) {
					return _match;
				}

				const count = (referenceCounts.get(footnote.id) ?? 0) + 1;
				referenceCounts.set(footnote.id, count);

				const referenceId = count === 1
					? `fnref-${footnote.id}`
					: `fnref-${footnote.id}-${count}`;

				if (count === 1) {
					footnote.firstReferenceId = referenceId;
				}

				return `<sup class="footnote-ref"><a href="#fn-${footnote.id}" id="${referenceId}">${footnote.index}</a></sup>`;
			});
		}).join('');

		output.push(replaced);
	}

	return output.join('\n');
}

async function renderFootnotes(footnotes: FootnoteDefinition[]) {
	if (footnotes.length === 0) {
		return '';
	}

	const items = await Promise.all(footnotes.map(async (footnote) => {
		const renderedContent = additionalProcessMd(await renderMarkdown(footnote.content)).trim();
		return `<li id="fn-${footnote.id}">\n${renderedContent}\n<p><a href="#${footnote.firstReferenceId}" class="footnote-backref icon-[mdi--arrow-left-bottom]" aria-label="Back to content"></a></p>\n</li>`;
	}));

	return [
		'<section class="footnotes">',
		'<hr>',
		'<ol>',
		items.join('\n'),
		'</ol>',
		'</section>',
	].join('\n');
}

function svelteMarkdown(): PreprocessorGroup {
	return {
		name: 'svelte-markdown',
		markup: async ({ content, filename }) => {
			if (filename == null || !filename.endsWith('.md')) {
				return { code: content };
			}

			const {
				data,
				content: htmlWithoutMeta,
			} = matter(content);

			const {
				content: contentWithoutFootnotes,
				footnotes,
				footnoteMap,
			} = collectFootnotes(htmlWithoutMeta);
			const contentWithFootnotes = replaceFootnoteReferences(contentWithoutFootnotes, footnoteMap);
			const html = await renderMarkdown(contentWithFootnotes);
			const footnotesHtml = await renderFootnotes(footnotes);
			const processed = additionalProcessMd(`${html}${footnotesHtml}`);

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

if (import.meta.vitest != null) {
	describe('additionalProcessMd', () => {
		it('replaces magic links in rendered html', () => {
			const html = additionalProcessMd('<p>{@ryoppippi} {Svelte Japan}</p>');

			expect(html).toContain('href="https://github.com/ryoppippi"');
			expect(html).toContain('target="_blank" rel="noopener"');
			expect(html).toContain('https://svelte.jp');
		});

		it('escapes braces inside code tags for Svelte compatibility', () => {
			expect(additionalProcessMd('<p><code>{count}</code></p>')).toContain(
				'<code>&#123;count&#125;</code>',
			);
		});

		it('removes trailing markdown image attributes after html image tags', () => {
			expect(additionalProcessMd('<p><img src="./image.png" alt="alt">{width=480}</p>')).toBe(
				'<p><img src="./image.png" alt="alt"></p>',
			);
		});

		it('unwraps Svelte component paragraphs', () => {
			expect(additionalProcessMd('<p><Tweet id="123" /></p>')).toBe('<Tweet id="123" />');
		});

		it('unwraps Svelte component paragraphs with attributes', () => {
			expect(additionalProcessMd('<p style="word-break:keep-all"><Tweet id="123" /></p>')).toBe('<Tweet id="123" />');
		});

		it('unwraps link preview widgets from paragraphs', () => {
			expect(additionalProcessMd('<p><div class="link-preview-widget"></div></p>')).toBe(
				'<div class="link-preview-widget"></div>',
			);
		});

		it('unwraps link preview widgets from paragraphs with attributes', () => {
			expect(additionalProcessMd('<p style="word-break:keep-all"><div class="link-preview-widget"></div></p>')).toBe(
				'<div class="link-preview-widget"></div>',
			);
		});
	});

	describe('footnote processing', () => {
		it('collects footnote definitions without touching fenced code', () => {
			const result = collectFootnotes('text[^note]\n\n```md\n[^code]: no\n```\n\n[^note]: body');

			expect(result.footnotes).toHaveLength(1);
			expect(result.footnotes[0]).toMatchObject({
				key: 'note',
				content: 'body',
				id: 'note',
			});
			expect(result.content).toContain('```md\n[^code]: no\n```');
			expect(result.content).not.toContain('[^note]: body');
		});

		it('replaces references while preserving inline code references', () => {
			const result = collectFootnotes('`[^note]` and [^note]\n\n[^note]: body');
			const html = replaceFootnoteReferences(result.content, result.footnoteMap);

			expect(html).toContain('`[^note]`');
			expect(html).toContain('<sup class="footnote-ref"><a href="#fn-note" id="fnref-note">1</a></sup>');
		});

		it('renders collected footnotes with a back reference', async () => {
			const result = collectFootnotes('[^note]\n\n[^note]: footnote body');
			const content = replaceFootnoteReferences(result.content, result.footnoteMap);
			const html = await renderFootnotes(result.footnotes);

			expect(content).toContain('id="fnref-note"');
			expect(html).toContain('<section class="footnotes">');
			expect(html).toContain('<li id="fn-note">');
			expect(html).toContain('footnote body');
			expect(html).toContain('href="#fnref-note"');
		});
	});
}
