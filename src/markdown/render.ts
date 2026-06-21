import type { JsParserOptions } from '@ox-content/napi';
import oxContent from '@ox-content/napi';
import { rendererRich, transformerTwoslash } from '@shikijs/twoslash';
import { codeToHtml } from 'shiki';
import { slugify } from '../lib/slugify.server.ts';
import { applyBudouxHtml } from './budoux.ts';
import { transformCollapsibleBlocks } from './collapsible.ts';
import { addExternalLinkAttributes, escapeHtml } from './html.ts';
import { replaceImageFigures } from './image-figures.ts';
import { replaceLinkPreviews } from './link-preview.ts';
import { normalizeAngleLinks, replaceBareUrls } from './linkify.ts';
import { renderMagicLink } from './magic-link.ts';
import { transformerEscape } from './shiki-transformer.ts';

const {
	mergeHighlightedCodeBlocks,
	parseAndRender,
	transformMediaEmbeds,
	transformYoutubeEmbeds,
} = oxContent;

const oxContentOptions = {
	gfm: true,
	footnotes: true,
	taskLists: true,
	tables: true,
	strikethrough: true,
	autolinks: true,
} as const satisfies JsParserOptions;

type CodeBlock = {
	language: string;
	code: string;
};

type OpenCodeBlock = {
	language: string;
	lines: string[];
};

type FenceLine = {
	marker: string;
	info: string;
};

async function highlightCode(code: string, lang: string) {
	return codeToHtml(code, {
		lang,
		tabindex: false,
		themes: {
			dark: 'kanagawa-dragon',
			light: 'kanagawa-lotus',
		},
		transformers: [
			transformerTwoslash({
				explicitTrigger: true,
				renderer: rendererRich(),
			}),
			transformerEscape(),
		],
	});
}

function transformOutsideFences(content: string, transform: (line: string) => string) {
	const lines = content.split('\n');
	let inFence = false;
	let fenceMarker = '';

	return lines.map((line) => {
		const trimmed = line.trimStart();
		const fence = trimmed.match(/^(`{3,}|~{3,})/)?.[1];

		if (fence != null) {
			if (!inFence) {
				inFence = true;
				fenceMarker = fence;
			}
			else if (trimmed.startsWith(fenceMarker[0]) && fence.length >= fenceMarker.length) {
				inFence = false;
				fenceMarker = '';
			}

			return line;
		}

		return inFence ? line : transform(line);
	}).join('\n');
}

function escapeMagicLinkUnderscores(line: string) {
	return line.replace(/\{([^{}\n]+)\}/g, (match, input: string) => {
		if (renderMagicLink(input) == null) {
			return match;
		}

		return match.replace(/_/g, String.raw`\_`);
	});
}

function prepareOxContentMarkdown(content: string) {
	return transformOutsideFences(
		transformCollapsibleBlocks(content),
		(line) => {
			const embeds = line
				.replace(/<YouTube\s+youTubeId=(['"])([^'"]+)\1(?:\s+skipTo=\{\{[^}]+\}\})?\s*\/>/g, '<youtube id="$2" />')
				.replace(/<Divider\s*\/>/g, '<hr>');
			const preparedLine = replaceImageFigures(replaceLinkPreviews(normalizeAngleLinks(escapeMagicLinkUnderscores(embeds))));

			return replaceBareUrls(preparedLine);
		},
	);
}

function resolveCodeBlockLanguage(language: string, languageClass: string | undefined) {
	if (language.length > 0) {
		return language;
	}

	if (languageClass != null && languageClass.length > 0) {
		return languageClass;
	}

	return 'text';
}

function parseFenceLine(line: string): FenceLine | null {
	let indent = 0;
	while (indent < line.length && line[indent] === ' ') {
		indent += 1;
	}

	if (indent > 3) {
		return null;
	}

	const start = line[indent];
	if (start !== '`' && start !== '~') {
		return null;
	}

	let markerLength = 0;
	while (indent + markerLength < line.length && line[indent + markerLength] === start) {
		markerLength += 1;
	}

	if (markerLength < 3) {
		return null;
	}

	return {
		marker: start.repeat(markerLength),
		info: line.slice(indent + markerLength),
	};
}

function extractFencedCodeBlocks(source: string) {
	const codeBlocks: CodeBlock[] = [];
	const lines = source.split('\n');
	let current: OpenCodeBlock | null = null;
	let fenceMarker = '';

	for (const line of lines) {
		if (current == null) {
			const openingFence = parseFenceLine(line);
			if (openingFence == null) {
				continue;
			}

			fenceMarker = openingFence.marker;
			current = {
				language: openingFence.info.trim().split(/\s+/, 1)[0] ?? '',
				lines: [],
			};
			continue;
		}

		const closingFence = parseFenceLine(line);
		if (
			closingFence != null
			&& closingFence.info.trim().length === 0
			&& closingFence.marker[0] === fenceMarker[0]
			&& closingFence.marker.length >= fenceMarker.length
		) {
			codeBlocks.push({
				language: current.language,
				code: current.lines.join('\n'),
			});
			current = null;
			fenceMarker = '';
			continue;
		}

		current.lines.push(line);
	}

	return codeBlocks;
}

async function renderHighlightedCodeBlocks(source: string, html: string) {
	const codeBlocks = extractFencedCodeBlocks(source);
	const codeBlockPattern = /<pre><code(?: class="language-([^"]*)")?>[\s\S]*?<\/code><\/pre>/g;
	const chunks: string[] = [];
	let codeBlockIndex = 0;
	let lastIndex = 0;

	for (const match of html.matchAll(codeBlockPattern)) {
		const [codeBlockHtml, languageClass] = match;
		const index = match.index;
		const codeBlock = codeBlocks[codeBlockIndex];
		codeBlockIndex += 1;

		chunks.push(html.slice(lastIndex, index));

		if (codeBlock == null) {
			chunks.push(codeBlockHtml);
		}
		else {
			chunks.push(await highlightCode(codeBlock.code, resolveCodeBlockLanguage(codeBlock.language, languageClass)));
		}

		lastIndex = index + codeBlockHtml.length;
	}

	chunks.push(html.slice(lastIndex));
	return chunks.join('');
}

function stripHtml(html: string) {
	return html.replace(/<[^>]*>/g, '');
}

const idAttributePattern = /\sid=(["'])(.*?)\1/;

function hasHeaderAnchor(innerHtml: string) {
	for (const [anchor] of innerHtml.matchAll(/<a\b[^>]*>/g)) {
		const className = anchor.match(/\sclass=(["'])(.*?)\1/)?.[2];
		if (className != null && className.split(/\s+/).includes('header-anchor')) {
			return true;
		}
	}

	return false;
}

function resolveUniqueHeadingId(id: string, usedIds: Map<string, number>) {
	const usageCount = usedIds.get(id) ?? 0;
	usedIds.set(id, usageCount + 1);
	return usageCount === 0 ? id : `${id}-${usageCount + 1}`;
}

function resolveHeadingIdBase(existingId: string | undefined, innerHtml: string) {
	const contentId = slugify(stripHtml(innerHtml));
	if (existingId == null || existingId === contentId || existingId.startsWith(`${contentId}-`)) {
		return contentId;
	}

	return existingId;
}

function addHeadingAnchors(html: string) {
	const usedIds = new Map<string, number>();

	return html.replace(/<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/g, (match, level: string, attrs: string, innerHtml: string) => {
		const existingId = attrs.match(idAttributePattern)?.[2];
		const idBase = resolveHeadingIdBase(existingId, innerHtml);

		if (hasHeaderAnchor(innerHtml)) {
			if (existingId != null) {
				resolveUniqueHeadingId(idBase, usedIds);
			}
			return match;
		}

		const id = resolveUniqueHeadingId(idBase, usedIds);
		const escapedId = escapeHtml(id);
		const resolvedAttrs = existingId == null
			? `${attrs} id="${escapedId}"`
			: attrs.replace(idAttributePattern, ` id="${escapedId}"`);
		return `<h${level}${resolvedAttrs}>${innerHtml}<a class="header-anchor" href="#${escapeHtml(id)}" aria-hidden="true" tabindex="-1">#</a></h${level}>`;
	});
}

function postprocessRenderedHtml(html: string) {
	return addExternalLinkAttributes(addHeadingAnchors(html));
}

export async function renderMarkdown(content: string) {
	const prepared = prepareOxContentMarkdown(content);
	const result = parseAndRender(prepared, oxContentOptions);

	if (result.errors.length > 0) {
		throw new Error(`ox-content failed to render Markdown: ${result.errors.join('\n')}`);
	}

	const highlighted = mergeHighlightedCodeBlocks(result.html, await renderHighlightedCodeBlocks(prepared, result.html));
	const media = transformYoutubeEmbeds(transformMediaEmbeds(highlighted, {
		twitter: true,
		bluesky: true,
	}));

	return applyBudouxHtml(postprocessRenderedHtml(media));
}

if (import.meta.vitest != null) {
	describe('prepareOxContentMarkdown', () => {
		it('normalises angle links that contain parentheses', () => {
			expect(prepareOxContentMarkdown('[release](<https://example.com/a(1)>)')).toBe(
				'[release](https://example.com/a%281%29)',
			);
		});

		it('normalises bare angle links that contain parentheses', () => {
			expect(prepareOxContentMarkdown('<https://example.com/a(1)>')).toBe(
				'[https://example.com/a(1)](https://example.com/a%281%29)',
			);
		});

		it('converts markdown images with title attributes to image figures', () => {
			expect(prepareOxContentMarkdown('![alt](./image.png "caption"){width=480}')).toBe(
				'<figure><img src="./image.png" alt="alt" title="caption" loading="lazy" decoding="async"><figcaption>caption</figcaption></figure>',
			);
		});

		it('converts preview links to link card html', () => {
			expect(prepareOxContentMarkdown('[@preview](https://github.com/junkawa/figma_jp)')).toBe(
				'<div class="link-preview-widget"><a href="https://github.com/junkawa/figma_jp" rel="noopener" target="_blank"><div class="link-preview-widget-title">https://github.com/junkawa/figma_jp</div><div class="link-preview-widget-url">github.com</div></a></div>',
			);
		});

		it('converts collapsible blocks to details html', () => {
			expect(prepareOxContentMarkdown('+++ More\nbody\n+++')).toBe(
				'<details><summary><span class="details-marker"></span>More</summary>\nbody\n</details>',
			);
		});

		it('converts open collapsible blocks to open details html', () => {
			expect(prepareOxContentMarkdown('++> More\nbody\n++>')).toBe(
				'<details open><summary><span class="details-marker"></span>More</summary>\nbody\n</details>',
			);
		});

		it('leaves collapsible markers inside fenced code untouched', () => {
			expect(prepareOxContentMarkdown('```md\n+++ More\n```\n+++ Real\nbody\n+++')).toBe(
				'```md\n+++ More\n```\n<details><summary><span class="details-marker"></span>Real</summary>\nbody\n</details>',
			);
		});

		it('converts bare URLs to markdown links', () => {
			expect(prepareOxContentMarkdown('> https://example.com/a(1).')).toBe(
				'> [https://example.com/a(1)](https://example.com/a%281%29).',
			);
		});

		it('leaves existing markdown links untouched when converting bare URLs', () => {
			expect(prepareOxContentMarkdown('[site](https://example.com)')).toBe('[site](https://example.com)');
		});

		it('leaves malformed preview links untouched', () => {
			expect(prepareOxContentMarkdown('[@preview](https://%)')).toBe('[@preview](https://%)');
		});

		it('escapes underscores in recognised magic links before ox-content parses emphasis', () => {
			expect(prepareOxContentMarkdown('{tech_world18}')).toBe('{tech\\_world18}');
		});

		it('does not transform fenced code contents', () => {
			expect(prepareOxContentMarkdown('```md\n{tech_world18}\n```')).toBe('```md\n{tech_world18}\n```');
		});
	});

	describe('renderMarkdown', () => {
		it('renders tweets as static ox-content cards', async () => {
			const html = await renderMarkdown('<Tweet id="1234567890" />');

			expect(html).toContain('class="ox-tweet"');
			expect(html).toContain('href="https://x.com/i/web/status/1234567890"');
			expect(html).not.toContain('<Tweet');
		});

		it('renders legacy Svelte YouTube embeds with ox-content', async () => {
			const html = await renderMarkdown('<YouTube youTubeId="dQw4w9WgXcQ" />');

			expect(html).toContain('class="ox-youtube"');
			expect(html).toContain('src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"');
			expect(html).not.toContain('<YouTube');
		});

		it('renders legacy dividers as horizontal rules', async () => {
			const html = await renderMarkdown('<Divider />');

			expect(html).toContain('<hr>');
			expect(html).not.toContain('<Divider');
		});

		it('adds markdown-it-anchor compatible heading anchors', async () => {
			const html = await renderMarkdown('# Hello World');

			expect(html).toContain('<h1 id="hello-world">Hello World<a class="header-anchor" href="#hello-world" aria-hidden="true" tabindex="-1">#</a></h1>');
		});

		it('deduplicates repeated heading anchors', async () => {
			const html = await renderMarkdown('## Examples\n\n## Examples\n\n## Examples');

			expect(html).toContain('<h2 id="examples">Examples<a class="header-anchor" href="#examples" aria-hidden="true" tabindex="-1">#</a></h2>');
			expect(html).toContain('<h2 id="examples-2">Examples<a class="header-anchor" href="#examples-2" aria-hidden="true" tabindex="-1">#</a></h2>');
			expect(html).toContain('<h2 id="examples-3">Examples<a class="header-anchor" href="#examples-3" aria-hidden="true" tabindex="-1">#</a></h2>');
		});

		it('does not treat heading text as an existing anchor', async () => {
			const html = await renderMarkdown('# header-anchor literal');

			expect(html).toContain('<h1 id="header-anchor-literal">header-anchor literal<a class="header-anchor" href="#header-anchor-literal" aria-hidden="true" tabindex="-1">#</a></h1>');
		});

		it('adds markdown-it-link-attributes compatible external link attributes', async () => {
			const html = await renderMarkdown('[external](https://example.com) [local](/blog)');

			expect(html).toContain('<a href="https://example.com" target="_blank" rel="noopener noreferrer">external</a>');
			expect(html).toContain('<a href="/blog">local</a>');
		});

		it('renders GitHub alert blocks as ox callouts', async () => {
			const html = await renderMarkdown('> [!WARNING]\n> Be careful');

			expect(html).toContain('ox-callout');
			expect(html).toContain('ox-callout--warning');
			expect(html).toContain('Be careful');
		});

		it('applies markdown-it-budoux compatible paragraph rendering', async () => {
			const html = await renderMarkdown('今日は天気です。');

			expect(html).toContain('<p style="word-break:keep-all;overflow-wrap:anywhere;">');
			expect(html).toContain('今日は\u200B天気です。');
		});

		it('keeps syntax highlighted code blocks', async () => {
			const html = await renderMarkdown('```zig\nconst answer = 42;\n```');

			expect(html).toContain('class="shiki shiki-themes');
			expect(html).toContain('data-language="zig"');
			expect(html).toContain('<span');
			expect(html).not.toContain('tabindex="0"');
		});

		it('preserves raw details blocks used by existing posts', async () => {
			const html = await renderMarkdown('<details>\n<summary>More</summary>\n\nbody\n</details>');

			expect(html).toContain('<details>');
			expect(html).toContain('<summary>More</summary>');
			expect(html).toContain('body');
			expect(html).toContain('</details>');
		});

		it('renders collapsible block contents as parsed markdown inside details', async () => {
			const html = await renderMarkdown('+++ More\n\n## Hidden\n\nbody\n+++');

			expect(html).toContain('<details>');
			expect(html).toContain('<summary><span class="details-marker"></span>More</summary>');
			expect(html).toContain('<h2 id="hidden">Hidden<a class="header-anchor" href="#hidden" aria-hidden="true" tabindex="-1">#</a></h2>');
			expect(html).toContain('</details>');
		});

		it('renders the recap appendix as a closed details block', async () => {
			const html = await renderMarkdown('## おまけ\n\n+++ おまけ\n\n## Bun\n\n`ccusage`は偉大。\n\n+++');

			expect(html).toContain('<h2 id="おまけ">おまけ<a class="header-anchor" href="#おまけ" aria-hidden="true" tabindex="-1">#</a></h2>');
			expect(html).toContain('<details>');
			expect(html).toContain('<summary><span class="details-marker"></span>おまけ</summary>');
			expect(html).toContain('<h2 id="bun">Bun<a class="header-anchor" href="#bun" aria-hidden="true" tabindex="-1">#</a></h2>');
			expect(html).toContain('<code>ccusage</code>');
			expect(html).toContain('</details>');
		});
	});
}
