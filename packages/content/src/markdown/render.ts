import {
	applyIslandSsrHtml,
	transformAllPlugins,
	transformOgp,
	transformYouTube,
} from '@ox-content/vite-plugin';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import type { IslandModules } from '../islands.ts';
import { applyBudouxHtml } from './budoux.ts';
import { transformOutsideFences } from './fences.ts';
import { escapeHtml } from './html.ts';
import { renderNotByAIBadges, replaceNotByAIEmbeds } from './not-by-ai.ts';
import { renderHighlightedMarkdown } from './ox-highlight.ts';

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
	return transformOutsideFences(content, (line) =>
		replaceNotByAIEmbeds(
			line.replace(/<Tweet\s+id=(['"])(\d+)\1\s*\/>/g, '<span data-tweet-placeholder="$2"></span>'),
		),
	);
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
		.replace(/<p>(\s*<div class="ox-youtube"[\s\S]*?<\/div>\s*)<\/p>/g, '$1');
	const withoutTrailingAttributes = blockEmbeds.replace(/(<\/a>|<img\b[^>]*>)\{[^}\n]+\}/g, '$1');

	return wrapScrollableTables(withoutTrailingAttributes);
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
	const media = await transformYouTube(social);
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
	describe('renderMarkdown', () => {
		it('renders native Ox Content open graph embeds', async () => {
			const html = await renderMarkdown('<OgCard url="http://localhost/post" />');
			const mdxHtml = await renderMarkdown('<ogcard url="http://localhost/post"></ogcard>', {
				mdx: true,
			});

			expect(html).toContain('class="ox-ogp-simple"');
			expect(html).not.toMatch(/<p[^>]*>\s*<a class="ox-ogp-simple"/);
			expect(mdxHtml).toContain('class="ox-ogp-simple"');
		});

		it('renders consecutive native open graph embeds as separate cards', async () => {
			const html = await renderMarkdown(
				'<OgCard url="http://localhost/first" />\n\n<OgCard url="http://localhost/second" />',
			);

			expect(html.match(/class="ox-ogp-simple"/g)).toHaveLength(2);
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

		it('renders configured and GitHub magic links', async () => {
			const html = await renderMarkdown('{link:@ryoppippi} {link:vim-jp} {link:Svelte Japan}');

			expect(html).toContain('href="https://github.com/ryoppippi"');
			expect(html).toContain('href="https://vim-jp.org/"');
			expect(html).toContain('href="https://svelte.jp"');
			expect(html.match(/<a [^>]*class="ox-magic-link/g)).toHaveLength(3);
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

		it('preserves YouTube start times with Ox Content', async () => {
			const html = await renderMarkdown('<youtube id="dQw4w9WgXcQ" start="4190" />');

			expect(html).toContain('src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?start=4190"');
			expect(html).not.toContain('<p><div');
			expect(html).not.toContain('<youtube');
		});

		it('renders the NotByAI badge as an external link with both colour variants', async () => {
			const html = await renderMarkdown('<NotByAI />');

			expect(html).toContain(
				'<a href="https://notbyai.fyi" class="not-by-ai" aria-label="Written by human, not by AI" target="_blank" rel="noopener noreferrer">',
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

		it('preserves image alt text separately from captions', async () => {
			const html = await renderMarkdown('![A & B](./image.png "Visible caption")');

			expect(html).toContain('<img src="./image.png" alt="A &amp; B" loading="lazy">');
			expect(html).toContain('<figcaption>Visible caption</figcaption>');
		});

		it('removes trailing markdown attributes from links and images', async () => {
			const html = await renderMarkdown(
				'[slides](https://example.com){.text-xl}\n\n![alt](./image.png){width=480}',
			);

			expect(html).not.toContain('{.text-xl}');
			expect(html).not.toContain('{width=480}');
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

		it('renders configured details containers', async () => {
			const html = await renderMarkdown('::: details More\n\n## Hidden\n\nbody\n:::');

			expect(html).toContain('<details class="ox-container ox-container--details">');
			expect(html).toContain('<summary>More</summary>');
			expect(html).toContain(
				'<h2 id="hidden">Hidden<a class="header-anchor" href="#hidden" aria-label="Permalink to &quot;Hidden&quot;">#</a></h2>',
			);
			expect(html).toContain('</details>');
		});
	});
}
