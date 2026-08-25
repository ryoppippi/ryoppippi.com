import oxContent from '@ox-content/napi';
import { applyIslandSsrHtml, transformAllPlugins, transformOgp } from '@ox-content/vite-plugin';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import type { IslandModules } from '../islands.ts';
import { applyBudouxHtml } from './budoux.ts';
import { transformCollapsibleBlocks } from './collapsible.ts';
import { transformOutsideFences } from './fences.ts';
import { addExternalLinkAttributes, escapeHtml } from './html.ts';
import { replaceLinkPreviews } from './link-preview.ts';
import { normalizeAngleLinks, replaceBareUrls } from './linkify.ts';
import { renderNotByAIBadges, replaceNotByAIEmbeds } from './not-by-ai.ts';
import { renderHighlightedMarkdown } from './ox-highlight.ts';

const { transformYoutubeEmbeds } = oxContent;
const workspaceDirectory = path.resolve(import.meta.dirname, '../../../..');
const ogpCacheDirectory = path.resolve(import.meta.dirname, '../../../..', '.cache/ox-content/ogp');
const twitterCacheDirectory = path.join(workspaceDirectory, '.cache/ox-content/twitter');
const twitterMediaDirectory = path.join(workspaceDirectory, 'static/ox-content/twitter');

/**
 * Renders a post-colocated component to HTML so its island is present before
 * any JavaScript runs.
 *
 * Implemented by the callers that have a Vite SSR loader to hand, because a
 * `.svelte` file has to be compiled before it can be rendered.
 */
export type IslandRenderer = (
	moduleId: string,
	props: Record<string, unknown>,
) => Promise<string | null>;

export type RenderMarkdownOptions = {
	/** Component names available to this document, mapped to their module ids. */
	islands?: IslandModules;
	/** Whether Ox Content should parse MDX syntax for this document. */
	mdx?: boolean;
	renderIsland?: IslandRenderer;
};

function prepareOxContentMarkdown(content: string) {
	const body = transformCollapsibleBlocks(content);

	return transformOutsideFences(body, (line) => {
		const embeds = replaceNotByAIEmbeds(
			line
				.replace(/<Tweet\s+id=(['"])(\d+)\1\s*\/>/g, '<span data-tweet-placeholder="$2"></span>')
				.replace(/<Divider\s*\/>/g, '<hr>'),
		);
		const preparedLine = replaceLinkPreviews(normalizeAngleLinks(embeds));

		return replaceBareUrls(preparedLine);
	});
}

function wrapScrollableTables(html: string) {
	const commentPattern = /<!--[\s\S]*?-->/g;
	const wrap = (part: string) =>
		part.replace(
			/<table\b[^>]*>[\s\S]*?<\/table>/g,
			'<div class="table-scroll" role="region" aria-label="Scrollable table" tabindex="0"><span class="table-scroll-hint" aria-hidden="true">← scroll →</span>$&</div>',
		);
	let output = '';
	let offset = 0;

	// Comments survive rendering, so a table quoted inside one would otherwise
	// have wrapper markup spliced into the comment text.
	for (const match of html.matchAll(commentPattern)) {
		if (match.index == null) {
			continue;
		}

		output += wrap(html.slice(offset, match.index));
		output += match[0];
		offset = match.index + match[0].length;
	}

	return output + wrap(html.slice(offset));
}

function postprocessRenderedHtml(html: string) {
	const blockEmbeds = html
		.replace(/<p>\s*(<figure class="ox-tweet[\s\S]*?<\/figure>)\s*<\/p>/g, '$1')
		.replace(
			/<p\b([^>]*)>([\s\S]*?)(\s*<a class="ox-ogp-(?:card|simple)"[\s\S]*?<\/a>)\s*<\/p>/g,
			(_match, attrs: string, text: string, card: string) =>
				text.trim().length === 0 ? card : `<p${attrs}>${text.trimEnd()}</p>${card}`,
		)
		.replace(/<p>(\s*<div class="ox-youtube"[\s\S]*?<\/div>\s*)<\/p>/g, '$1')
		.replace(/<p>(\s*<hr>\s*)<\/p>/g, '$1');
	const withoutTrailingAttributes = blockEmbeds.replace(/(<\/a>|<img\b[^>]*>)\{[^}\n]+\}/g, '$1');

	return addExternalLinkAttributes(wrapScrollableTables(withoutTrailingAttributes));
}

async function renderIslands(
	html: string,
	islands: IslandModules,
	renderIsland: IslandRenderer | undefined,
) {
	const names = Object.keys(islands);
	const rendered =
		renderIsland == null
			? html
			: await applyIslandSsrHtml(
					html,
					async (name, props) => {
						const body = await renderIsland(islands[name], props);
						return body == null ? '' : `<div data-ox-island-root>${body}</div>`;
					},
					'/virtual/article.mdx',
					names,
				);

	return names.reduce(
		(output, name) =>
			output.replaceAll(
				`data-ox-island="${escapeHtml(name)}"`,
				`data-ox-island="${escapeHtml(islands[name])}"`,
			),
		rendered,
	);
}

function restoreTweetEmbeds(html: string) {
	const replacement = (_match: string, id: string) => `<Tweet id="${id}" />`;
	const blockPattern = /<p>\s*<span data-tweet-placeholder="(\d+)"><\/span>\s*<\/p>/g;
	const blocks = html.replace(blockPattern, replacement);
	const inlinePattern = /<span data-tweet-placeholder="(\d+)"><\/span>/g;
	return blocks.replace(inlinePattern, replacement);
}

export async function renderMarkdown(content: string, options: RenderMarkdownOptions = {}) {
	const islands = options.islands ?? {};
	const prepared = prepareOxContentMarkdown(content);
	const highlighted = await renderHighlightedMarkdown(
		prepared,
		options.mdx ?? Object.keys(islands).length > 0,
	);
	const social = await transformAllPlugins(restoreTweetEmbeds(highlighted), {
		bluesky: true,
		github: false,
		mermaid: false,
		ogp: false,
		tabs: false,
		twitter: {
			appearance: 'full',
			cacheDir: twitterCacheDirectory,
			downloadVideo: true,
			fetch: true,
			mediaOutputDir: twitterMediaDirectory,
			mediaPublicPath: '/ox-content/twitter',
		},
		youtube: false,
	});
	const media = transformYoutubeEmbeds(social);
	const openGraph = /<ogcard\b/i.test(media)
		? await transformOgp(media, undefined, {
				cacheDir: ogpCacheDirectory,
				persistCache: true,
				timeout: 8_000,
			})
		: media;

	// Islands are rendered after every HTML transform so BudouX and the link
	// rewrites cannot alter component markup that the client then hydrates.
	const body = await renderIslands(
		applyBudouxHtml(postprocessRenderedHtml(renderNotByAIBadges(openGraph))),
		islands,
		options.renderIsland,
	);
	return body;
}

if (import.meta.vitest != null) {
	describe('prepareOxContentMarkdown', () => {
		it('renders preview links through the Ox Content open graph embed', async () => {
			const html = await renderMarkdown('[@preview](http://localhost/post)');

			expect(html).toContain('class="ox-ogp-simple"');
			expect(html).not.toMatch(/<p[^>]*>\s*<a class="ox-ogp-simple"/);
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

		it('converts preview links to link card html', () => {
			expect(prepareOxContentMarkdown('[@preview](https://github.com/junkawa/figma_jp)')).toBe(
				'<ogcard url="https://github.com/junkawa/figma_jp" />',
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

		it('preserves Ox Content magic link syntax for the renderer', () => {
			expect(prepareOxContentMarkdown('{link:tech_world18}')).toBe('{link:tech_world18}');
		});

		it('does not transform fenced code contents', () => {
			expect(prepareOxContentMarkdown('```md\n{link:tech_world18}\n```')).toBe(
				'```md\n{link:tech_world18}\n```',
			);
		});
	});

	describe('renderMarkdown', () => {
		it('renders image captions and dimensions with Ox Content', async () => {
			const html = await renderMarkdown('![alt](./image.png "caption"){width=480}');

			expect(html).toContain('<figure class="ox-figure">');
			expect(html).toContain('loading="lazy"');
			expect(html).toContain('width="480"');
			expect(html).toContain('<figcaption>caption</figcaption>');
		});

		it('wraps markdown tables in a keyboard-scrollable region', async () => {
			const html = await renderMarkdown('| Name | Value |\n|---|---:|\n| Example | 42 |');

			expect(html).toContain(
				'<div class="table-scroll" role="region" aria-label="Scrollable table" tabindex="0"><span class="table-scroll-hint" aria-hidden="true">← scroll →</span><table>',
			);
			expect(html).toContain('</table></div>');
		});

		it('leaves a table quoted inside an HTML comment unwrapped', async () => {
			const html = await renderMarkdown('<!--\n<table><tr><td>a</td></tr></table>\n-->');

			expect(html).toContain('<!--\n<table><tr><td>a</td></tr></table>\n-->');
			expect(html).not.toContain('table-scroll');
		});

		it('preserves multiline HTML comments without transforming their contents', async () => {
			const html = await renderMarkdown(
				'before\n\n<!--\nhttps://x.com/example/status/1234567890\n-->\n\nafter',
			);

			expect(html).toContain('before');
			expect(html).toContain('after');
			expect(html).toContain('<!--\nhttps://x.com/example/status/1234567890\n-->');
			expect(html).not.toContain('[https://x.com/example/status/1234567890]');
		});

		it('renders configured and GitHub magic links', async () => {
			const html = await renderMarkdown('{link:@ryoppippi} {link:vim-jp} {link:Svelte Japan}');

			expect(html).toContain('href="https://github.com/ryoppippi"');
			expect(html).toContain('href="https://vim-jp.org/"');
			expect(html).toContain('href="https://svelte.jp"');
			expect(html.match(/<a [^>]*class="ox-magic-link/g)).toHaveLength(3);
		});

		it('leaves magic link syntax inside code unchanged', async () => {
			const html = await renderMarkdown('`{link:@github}`\n\n```md\n{link:@github}\n```');

			expect(html).toContain('{link:@github}');
			expect(html).not.toContain('class="ox-magic-link');
		});

		it('renders tweets as static ox-content cards', async () => {
			const id = '9876543210987654321';
			vi.stubGlobal(
				'fetch',
				vi.fn(async () =>
					Response.json({
						conversation_count: 2,
						favorite_count: 3,
						id_str: id,
						text: 'Static Tweet body',
						user: { name: 'Ox Content', screen_name: 'ox_content' },
					}),
				),
			);

			try {
				const html = await renderMarkdown(`<Tweet id="${id}" />`);

				expect(html).toContain('class="ox-tweet ox-tweet--fetched ox-tweet--full"');
				expect(html).toContain('Static Tweet body');
				expect(html).toContain('class="ox-tweet__actions"');
				expect(html).not.toContain('<p><figure');
				expect(html).not.toContain('<Tweet');
				expect(html).not.toContain('<script');
			} finally {
				vi.unstubAllGlobals();
				await rm(path.join(twitterCacheDirectory, `${id}-en.json`), { force: true });
			}
		});

		it('renders YouTube embeds with Ox Content', async () => {
			const html = await renderMarkdown('<youtube id="dQw4w9WgXcQ" />');

			expect(html).toContain('class="ox-youtube"');
			expect(html).toContain('src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"');
			expect(html).not.toContain('<p><div');
			expect(html).not.toContain('<youtube');
		});

		it('preserves YouTube start times with Ox Content', async () => {
			const html = await renderMarkdown('<youtube id="dQw4w9WgXcQ" start="4190" />');

			expect(html).toContain('src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?start=4190"');
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

		it('adds accessible heading permalinks', async () => {
			const html = await renderMarkdown('# Hello World');

			expect(html).toContain(
				'<h1 id="hello-world">Hello World<a class="header-anchor" href="#hello-world" aria-label="Permalink to &quot;Hello World&quot;">#</a></h1>',
			);
		});

		it('deduplicates repeated heading anchors', async () => {
			const html = await renderMarkdown('## Examples\n\n## Examples\n\n## Examples');

			expect(html).toContain(
				'<h2 id="examples">Examples<a class="header-anchor" href="#examples" aria-label="Permalink to &quot;Examples&quot;">#</a></h2>',
			);
			expect(html).toContain(
				'<h2 id="examples-1">Examples<a class="header-anchor" href="#examples-1" aria-label="Permalink to &quot;Examples&quot;">#</a></h2>',
			);
			expect(html).toContain(
				'<h2 id="examples-2">Examples<a class="header-anchor" href="#examples-2" aria-label="Permalink to &quot;Examples&quot;">#</a></h2>',
			);
		});

		it('does not treat heading text as an existing anchor', async () => {
			const html = await renderMarkdown('# header-anchor literal');

			expect(html).toContain(
				'<h1 id="header-anchor-literal">header-anchor literal<a class="header-anchor" href="#header-anchor-literal" aria-label="Permalink to &quot;header-anchor literal&quot;">#</a></h1>',
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

			expect(html).toContain('<sup><a href="#fn-note" id="fnref-note">1</a></sup>');
			expect(html).toContain('id="fnref-note-2"');
			expect(html).toContain('<section class="footnotes" aria-label="Footnotes">');
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

		it('turns registered component tags into island placeholders', async () => {
			const html = await renderMarkdown('<Chart title="Growth" bars={3} />', {
				islands: { Chart: 'post/Chart.svelte' },
			});

			expect(html).toContain('data-ox-island="post/Chart.svelte"');
			expect(html).toContain('data-ox-props=');
			expect(html).not.toContain('<Chart');
		});

		it('passes island props through the HTML pipeline', async () => {
			const renderIsland = vi.fn(async () => '<p>chart</p>');
			const html = await renderMarkdown('<Chart lang="en" />', {
				islands: { Chart: 'post/Chart.svelte' },
				renderIsland,
			});

			expect(renderIsland).toHaveBeenCalledWith('post/Chart.svelte', { lang: 'en' });
			expect(html).toContain('data-ox-island-root');
		});

		it('leaves component tags alone when the post has no such component', async () => {
			const html = await renderMarkdown('<Chart />');

			expect(html).not.toContain('data-ox-island');
		});

		it('drops the import statement of a resolved component', async () => {
			const html = await renderMarkdown("import Chart from './Chart.svelte'\n\n<Chart />", {
				islands: { Chart: 'post/Chart.svelte' },
			});

			expect(html).toContain('data-ox-island="post/Chart.svelte"');
			expect(html).not.toContain('import Chart');
		});

		it('keeps an import that resolved to nothing so the mistake is visible', async () => {
			const html = await renderMarkdown("import Chart from './Missing.svelte'");

			expect(html).toContain('import Chart');
		});

		it('applies markdown-it-budoux compatible paragraph rendering', async () => {
			const html = await renderMarkdown('今日は天気です。');

			expect(html).toContain('<p style="word-break:keep-all;overflow-wrap:anywhere;">');
			expect(html).toContain('今日は\u200B天気です。');
		});

		it('keeps syntax highlighted code blocks', async () => {
			const html = await renderMarkdown('```ts\nconst answer = 42;\n```');

			expect(html).toContain('class="ox-highlight css-variables"');
			expect(html).toContain('data-language="ts"');
			expect(html).toContain('<span');
			expect(html).toContain('tabindex="0"');
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
				'<h2 id="hidden">Hidden<a class="header-anchor" href="#hidden" aria-label="Permalink to &quot;Hidden&quot;">#</a></h2>',
			);
			expect(html).toContain('</details>');
		});

		it('renders the recap appendix as a closed details block', async () => {
			const html = await renderMarkdown(
				'## おまけ\n\n+++ おまけ\n\n## Bun\n\n`ccusage`は偉大。\n\n+++',
			);

			expect(html).toContain(
				'<h2 id="おまけ">おまけ<a class="header-anchor" href="#おまけ" aria-label="Permalink to &quot;おまけ&quot;">#</a></h2>',
			);
			expect(html).toContain('<details>');
			expect(html).toContain('<summary><span class="details-marker"></span>おまけ</summary>');
			expect(html).toContain(
				'<h2 id="bun">Bun<a class="header-anchor" href="#bun" aria-label="Permalink to &quot;Bun&quot;">#</a></h2>',
			);
			expect(html).toContain('<code>ccusage</code>');
			expect(html).toContain('</details>');
		});
	});
}
