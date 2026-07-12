import oxContent from '@ox-content/napi';
import { transformOgp } from '@ox-content/vite-plugin';
import type { TweetData } from '../tweet-renderer.ts';
import type { OgpSnapshots } from '../ogp-snapshots.ts';
import { slugify } from '../lib/slugify.ts';
import { applyBudouxHtml } from './budoux.ts';
import { transformCollapsibleBlocks } from './collapsible.ts';
import { extractFootnotes, renderFootnotes } from './footnotes.ts';
import { addExternalLinkAttributes, escapeHtml } from './html.ts';
import { replaceImageFigures } from './image-figures.ts';
import { replaceLinkPreviews } from './link-preview.ts';
import { normalizeAngleLinks, replaceBareUrls } from './linkify.ts';
import { renderMagicLink, replaceMagicLinks } from './magic-link.ts';
import { renderNotByAIBadges, replaceNotByAIEmbeds } from './not-by-ai.ts';
import { renderHighlightedMarkdown } from './ox-highlight.ts';

const { transformMediaEmbeds, transformYoutubeEmbeds } = oxContent;

export type TweetSnapshots = Record<string, TweetData>;

export type TweetRenderer = (id: string, tweet?: TweetData) => Promise<string>;

export type RenderMarkdownOptions = {
	openGraph?: OgpSnapshots;
	renderTweet?: TweetRenderer;
	tweets?: TweetSnapshots;
};

function transformOutsideFences(content: string, transform: (line: string) => string) {
	const lines = content.split('\n');
	let inFence = false;
	let fenceMarker = '';

	return lines
		.map((line) => {
			const trimmed = line.trimStart();
			const fence = trimmed.match(/^(`{3,}|~{3,})/)?.[1];

			if (fence != null) {
				if (!inFence) {
					inFence = true;
					fenceMarker = fence;
				} else if (trimmed.startsWith(fenceMarker[0]) && fence.length >= fenceMarker.length) {
					inFence = false;
					fenceMarker = '';
				}

				return line;
			}

			return inFence ? line : transform(line);
		})
		.join('\n');
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
	return transformOutsideFences(transformCollapsibleBlocks(content), (line) => {
		const embeds = replaceNotByAIEmbeds(
			line
				.replace(/<Tweet\s+id=(['"])(\d+)\1\s*\/>/g, '<span data-tweet-placeholder="$2"></span>')
				.replace(
					/<YouTube\s+youTubeId=(['"])([^'"]+)\1(?:\s+skipTo=\{\{[^}]+\}\})?\s*\/>/g,
					'<youtube id="$2" />',
				)
				.replace(/<Divider\s*\/>/g, '<hr>'),
		);
		const preparedLine = replaceImageFigures(
			replaceLinkPreviews(normalizeAngleLinks(escapeMagicLinkUnderscores(embeds))),
		);

		return replaceBareUrls(preparedLine);
	});
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

	return html.replace(
		/<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/g,
		(match, level: string, attrs: string, innerHtml: string) => {
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
			const resolvedAttrs =
				existingId == null
					? `${attrs} id="${escapedId}"`
					: attrs.replace(idAttributePattern, ` id="${escapedId}"`);
			return `<h${level}${resolvedAttrs}>${innerHtml}<a class="header-anchor" href="#${escapeHtml(id)}" aria-hidden="true" tabindex="-1">#</a></h${level}>`;
		},
	);
}

function replaceMagicLinksOutsideProtectedHtml(html: string) {
	const protectedBlockPattern = /<(pre|code|script|style)\b[^>]*>[\s\S]*?<\/\1>/gi;
	let output = '';
	let offset = 0;

	for (const match of html.matchAll(protectedBlockPattern)) {
		if (match.index == null) {
			continue;
		}

		output += replaceMagicLinks(html.slice(offset, match.index));
		output += match[0];
		offset = match.index + match[0].length;
	}

	return output + replaceMagicLinks(html.slice(offset));
}

function postprocessRenderedHtml(html: string) {
	const blockEmbeds = html
		.replace(/<article class="ox-tweet">([\s\S]*?)<\/article>/g, '<span class="ox-tweet">$1</span>')
		.replace(
			/<p\b([^>]*)>([\s\S]*?)(\s*<a class="ox-ogp-(?:card|simple)"[\s\S]*?<\/a>)\s*<\/p>/g,
			(_match, attrs: string, text: string, card: string) =>
				text.trim().length === 0 ? card : `<p${attrs}>${text.trimEnd()}</p>${card}`,
		)
		.replace(/<p>(\s*<div class="ox-youtube"[\s\S]*?<\/div>\s*)<\/p>/g, '$1')
		.replace(/<p>(\s*<hr>\s*)<\/p>/g, '$1');
	const withoutTrailingAttributes = blockEmbeds.replace(/(<\/a>|<img\b[^>]*>)\{[^}\n]+\}/g, '$1');

	return addExternalLinkAttributes(addHeadingAnchors(withoutTrailingAttributes));
}

async function replaceAsync(
	value: string,
	pattern: RegExp,
	replacer: (match: RegExpExecArray) => Promise<string>,
) {
	const matches = [...value.matchAll(pattern)];
	if (matches.length === 0) {
		return value;
	}

	const replacements = await Promise.all(matches.map(replacer));
	let output = '';
	let offset = 0;
	for (const [index, match] of matches.entries()) {
		output += value.slice(offset, match.index) + replacements[index];
		offset = match.index + match[0].length;
	}
	return output + value.slice(offset);
}

async function renderTweets(
	html: string,
	{ renderTweet, tweets }: Pick<RenderMarkdownOptions, 'renderTweet' | 'tweets'>,
) {
	const replacement = (match: RegExpExecArray) => {
		if (renderTweet == null) {
			return Promise.resolve(`<Tweet id="${match[1]}" />`);
		}

		return renderTweet(match[1], tweets?.[match[1]]);
	};
	const blockPattern = /<p>\s*<span data-tweet-placeholder="(\d+)"><\/span>\s*<\/p>/g;
	const blocks = await replaceAsync(html, blockPattern, replacement);
	const inlinePattern = /<span data-tweet-placeholder="(\d+)"><\/span>/g;
	return replaceAsync(blocks, inlinePattern, replacement);
}

export async function renderMarkdown(content: string, options: RenderMarkdownOptions = {}) {
	const extracted = extractFootnotes(content);
	const prepared = prepareOxContentMarkdown(extracted.content);
	const highlighted = await renderHighlightedMarkdown(prepared);
	const magicLinks = replaceMagicLinksOutsideProtectedHtml(highlighted);
	const tweets = await renderTweets(magicLinks, options);
	const media = transformYoutubeEmbeds(
		transformMediaEmbeds(tweets, {
			twitter: true,
			bluesky: true,
		}),
	);
	const openGraphData =
		options.openGraph == null ? undefined : new Map(Object.entries(options.openGraph));
	const openGraph = /<ogcard\b/i.test(media)
		? await transformOgp(media, openGraphData, { timeout: 8_000 })
		: media;

	const body = applyBudouxHtml(postprocessRenderedHtml(renderNotByAIBadges(openGraph)));
	const footnotes = await renderFootnotes(extracted.footnotes, (footnote) =>
		renderMarkdown(footnote, options),
	);
	return body + footnotes;
}

if (import.meta.vitest != null) {
	describe('prepareOxContentMarkdown', () => {
		it('renders preview links through the Ox Content open graph embed', async () => {
			const html = await renderMarkdown('[@preview](http://localhost/post)');

			expect(html).toContain('class="ox-ogp-simple"');
			expect(html).not.toMatch(/<p[^>]*>\s*<a class="ox-ogp-simple"/);
		});

		it('renders a fallback preview without fetching when metadata is unavailable', async () => {
			const html = await renderMarkdown('[@preview](https://example.com/post)', {
				openGraph: {},
			});

			expect(html).toContain('class="ox-ogp-simple"');
			expect(html).toContain('href="https://example.com/post"');
		});

		it('separates a preview card from preceding prose', async () => {
			const url = 'https://example.com/post';
			const html = await renderMarkdown(`説明文\n[@preview](${url})`, {
				openGraph: {
					[url]: {
						url,
						title: 'Example post',
						description: 'Example description',
						siteName: 'Example',
					},
				},
			});

			expect(html).toMatch(/<\/p>\s*<a class="ox-ogp-card"/);
			expect(html).not.toMatch(/<p\b[^>]*>[^<]*<a class="ox-ogp-card"/);
		});

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
				'<OgCard url="https://github.com/junkawa/figma_jp" />',
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
			expect(prepareOxContentMarkdown('[site](https://example.com)')).toBe(
				'[site](https://example.com)',
			);
		});

		it('leaves malformed preview links untouched', () => {
			expect(prepareOxContentMarkdown('[@preview](https://%)')).toBe('[@preview](https://%)');
		});

		it('escapes underscores in recognised magic links before ox-content parses emphasis', () => {
			expect(prepareOxContentMarkdown('{tech_world18}')).toBe('{tech\\_world18}');
		});

		it('does not transform fenced code contents', () => {
			expect(prepareOxContentMarkdown('```md\n{tech_world18}\n```')).toBe(
				'```md\n{tech_world18}\n```',
			);
		});
	});

	describe('renderMarkdown', () => {
		it('renders configured and GitHub magic links', async () => {
			const html = await renderMarkdown('{@ryoppippi} {vim-jp} {Svelte Japan}');

			expect(html).toContain('href="https://github.com/ryoppippi"');
			expect(html).toContain('href="https://vim-jp.org/"');
			expect(html).toContain('href="https://svelte.jp"');
			expect(html.match(/<a [^>]*class="markdown-magic-link/g)).toHaveLength(3);
		});

		it('leaves magic link syntax inside code unchanged', async () => {
			const html = await renderMarkdown('`{@github}`\n\n```md\n{@github}\n```');

			expect(html).toContain('{@github}');
			expect(html).not.toContain('class="markdown-magic-link');
		});

		it('renders tweets as static ox-content cards', async () => {
			const html = await renderMarkdown('<Tweet id="1234567890" />');

			expect(html).toContain('class="ox-tweet"');
			expect(html).toContain('href="https://x.com/i/web/status/1234567890"');
			expect(html).not.toContain('<p><article');
			expect(html).not.toContain('<Tweet');
		});

		it('uses the SSG tweet renderer when provided', async () => {
			const html = await renderMarkdown('<Tweet id="1234567890" />', {
				renderTweet: async (id) =>
					`<article class="sveltweet-ssg" data-tweet-id="${id}">Tweet body</article>`,
			});

			expect(html).toContain('class="sveltweet-ssg"');
			expect(html).toContain('data-tweet-id="1234567890"');
			expect(html).not.toContain('class="ox-tweet"');
		});

		it('passes no data to the renderer when a tweet snapshot is unavailable', async () => {
			const renderTweet = vi.fn(
				async (id: string) => `<a href="https://x.com/i/web/status/${id}">Tweet</a>`,
			);

			await renderMarkdown('<Tweet id="1234567890" />', { renderTweet, tweets: {} });

			expect(renderTweet).toHaveBeenCalledWith('1234567890', undefined);
		});

		it('renders legacy Svelte YouTube embeds with ox-content', async () => {
			const html = await renderMarkdown('<YouTube youTubeId="dQw4w9WgXcQ" />');

			expect(html).toContain('class="ox-youtube"');
			expect(html).toContain('src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"');
			expect(html).not.toContain('<p><div');
			expect(html).not.toContain('<YouTube');
		});

		it('renders legacy dividers as horizontal rules', async () => {
			const html = await renderMarkdown('<Divider />');

			expect(html).toContain('<hr>');
			expect(html).not.toContain('<Divider');
		});

		it('renders the NotByAI badge as an external link with both colour variants', async () => {
			const html = await renderMarkdown('<NotByAI />');

			expect(html).toContain(
				'<a href="https://notbyai.fyi" class="not-by-ai" aria-label="Written by human, not by AI" target="_blank" rel="noopener">',
			);
			expect(html).toContain('class="not-by-ai-badge not-by-ai-badge--light"');
			expect(html).toContain('class="not-by-ai-badge not-by-ai-badge--dark"');
			expect(html).not.toContain('<NotByAI');
			expect(html).not.toContain('data-not-by-ai-placeholder');
		});

		it('renders the NotByAI badge inside callout blocks', async () => {
			const html = await renderMarkdown('> [!NOTE]\n> <NotByAI />');

			expect(html).toContain('ox-callout--note');
			expect(html).toContain('class="not-by-ai-badge not-by-ai-badge--light"');
		});

		it('leaves NotByAI syntax inside code fences unchanged', async () => {
			const html = await renderMarkdown('```md\n<NotByAI />\n```');

			expect(html).toContain('NotByAI');
			expect(html).not.toContain('not-by-ai-badge');
			expect(html).not.toContain('data-not-by-ai-placeholder');
		});

		it('adds markdown-it-anchor compatible heading anchors', async () => {
			const html = await renderMarkdown('# Hello World');

			expect(html).toContain(
				'<h1 id="hello-world">Hello World<a class="header-anchor" href="#hello-world" aria-hidden="true" tabindex="-1">#</a></h1>',
			);
		});

		it('deduplicates repeated heading anchors', async () => {
			const html = await renderMarkdown('## Examples\n\n## Examples\n\n## Examples');

			expect(html).toContain(
				'<h2 id="examples">Examples<a class="header-anchor" href="#examples" aria-hidden="true" tabindex="-1">#</a></h2>',
			);
			expect(html).toContain(
				'<h2 id="examples-2">Examples<a class="header-anchor" href="#examples-2" aria-hidden="true" tabindex="-1">#</a></h2>',
			);
			expect(html).toContain(
				'<h2 id="examples-3">Examples<a class="header-anchor" href="#examples-3" aria-hidden="true" tabindex="-1">#</a></h2>',
			);
		});

		it('does not treat heading text as an existing anchor', async () => {
			const html = await renderMarkdown('# header-anchor literal');

			expect(html).toContain(
				'<h1 id="header-anchor-literal">header-anchor literal<a class="header-anchor" href="#header-anchor-literal" aria-hidden="true" tabindex="-1">#</a></h1>',
			);
		});

		it('adds markdown-it-link-attributes compatible external link attributes', async () => {
			const html = await renderMarkdown('[external](https://example.com) [local](/blog)');

			expect(html).toContain(
				'<a href="https://example.com" target="_blank" rel="noopener noreferrer">external</a>',
			);
			expect(html).toContain('<a href="/blog">local</a>');
		});

		it('removes trailing markdown attributes from links and images', async () => {
			const html = await renderMarkdown(
				'[slides](https://example.com){.text-xl}\n\n![alt](./image.png){width=480}',
			);

			expect(html).not.toContain('{.text-xl}');
			expect(html).not.toContain('{width=480}');
		});

		it('renders footnotes with back references', async () => {
			const html = await renderMarkdown(
				'Footnote[^note] and again[^note].\n\n[^note]: **footnote body**',
			);

			expect(html).toContain(
				'<sup class="footnote-ref"><a href="#fn-note" id="fnref-note">1</a></sup>',
			);
			expect(html).toContain('id="fnref-note-2"');
			expect(html).toContain('<section class="footnotes">');
			expect(html).toContain('<li id="fn-note">');
			expect(html).toContain('<strong>footnote body</strong>');
			expect(html).toContain('href="#fnref-note"');
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
			expect(html).toContain(
				'<h2 id="hidden">Hidden<a class="header-anchor" href="#hidden" aria-hidden="true" tabindex="-1">#</a></h2>',
			);
			expect(html).toContain('</details>');
		});

		it('renders the recap appendix as a closed details block', async () => {
			const html = await renderMarkdown(
				'## おまけ\n\n+++ おまけ\n\n## Bun\n\n`ccusage`は偉大。\n\n+++',
			);

			expect(html).toContain(
				'<h2 id="おまけ">おまけ<a class="header-anchor" href="#おまけ" aria-hidden="true" tabindex="-1">#</a></h2>',
			);
			expect(html).toContain('<details>');
			expect(html).toContain('<summary><span class="details-marker"></span>おまけ</summary>');
			expect(html).toContain(
				'<h2 id="bun">Bun<a class="header-anchor" href="#bun" aria-hidden="true" tabindex="-1">#</a></h2>',
			);
			expect(html).toContain('<code>ccusage</code>');
			expect(html).toContain('</details>');
		});
	});
}
