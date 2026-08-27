import {
	applyIslandSsrHtml,
	renderMarkdown as renderOxMarkdown,
	transformAllPlugins,
	type OxContentOptions,
} from '@ox-content/vite-plugin';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import type { IslandModules } from '../islands.ts';
import { escapeHtml } from './html.ts';

const workspaceDirectory = path.resolve(import.meta.dirname, '../../../..');
const ogpCacheDirectory = path.resolve(import.meta.dirname, '../../../..', '.cache/ox-content/ogp');
const twitterCacheDirectory = path.join(workspaceDirectory, '.cache/ox-content/twitter');
const twitterMediaDirectory = path.join(workspaceDirectory, 'static/ox-content/twitter');

const magicLinkAliases = {
	'vim-jp': {
		href: 'https://vim-jp.org/',
		image: 'https://vim-jp.org/assets/images/vim2-128.png',
	},
	'vim-jp-radio': {
		href: 'https://vim-jp-radio.com/',
		image:
			'https://cdn.jsdelivr.net/gh/vim-jp-radio/LP@main/src/assets/vimjp-radio-cover-art/800x800-fs8.png',
	},
	'Svelte Japan': {
		href: 'https://svelte.jp',
		image: 'https://cdn.jsdelivr.net/gh/sveltejs/branding/svelte-logo-square.png',
	},
	'ryoppippi.com': {
		href: 'https://ryoppippi.com',
		image: 'https://ryoppippi.com/ryoppippi.jpg',
	},
	tech_world18: {
		href: 'https://x.com/tech_world18',
		image: 'https://pbs.twimg.com/profile_images/1717677089154088960/tDuRN0aB_400x400.jpg',
	},
	'TECH WORLD': {
		href: 'https://www.youtube.com/channel/UCISDrqLMNq3w9AZ4otdoRuA',
		image: 'https://pbs.twimg.com/profile_images/1920681519682908160/0sY6R8FJ_400x400.jpg',
	},
	Rork: {
		href: 'https://rork.com/',
		image: 'https://pbs.twimg.com/profile_images/2024413445236600832/nNHMz2Sc_bigger.jpg',
	},
	typia: {
		href: 'https://github.com/samchon/typia',
		image: 'https://github.com/samchon.png',
	},
	NeovimConf: {
		href: 'https://neovimconf.live/',
		image: 'https://github.com/neovim.png',
	},
	eerm16g: {
		href: 'https://x.com/eerm16g',
		image: 'https://pbs.twimg.com/profile_images/1959591256381927424/ULcgBpZx_400x400.jpg',
	},
} as const;

const OX_MARKDOWN_OPTIONS = {
	attrs: true,
	budoux: true,
	embeds: false,
	frontmatter: false,
	headingPermalinks: true,
	highlight: true,
	images: true,
	containers: {
		types: {
			details: { tag: 'details' },
		},
	},
	magicLinks: {
		aliases: magicLinkAliases,
		favicon: { template: 'https://favicon.yandex.net/favicon/{host}' },
	},
	notByAi: true,
	ogViewer: false,
	search: false,
	semanticFootnotes: true,
	ssg: false,
	toc: false,
} as const satisfies OxContentOptions;

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

/** Options for rendering a Markdown or MDX document into the site article body. */
export type RenderMarkdownOptions = {
	/** Component names available to this document, mapped to their module ids. */
	islands?: IslandModules;
	/** Whether Ox Content should parse MDX syntax for this document. */
	mdx?: boolean;
	renderIsland?: IslandRenderer;
};

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

/**
 * Renders Markdown with Ox Content and the site's post-render transforms.
 *
 * @param content - Markdown or MDX source text.
 * @param options - Document-specific island and parser options.
 * @returns The rendered article HTML and referenced island module ids.
 */
export async function renderMarkdown(content: string, options: RenderMarkdownOptions = {}) {
	const islands = options.islands ?? {};
	const mdx = options.mdx ?? Object.keys(islands).length > 0;
	const transformed = await renderOxMarkdown(
		content,
		`/virtual/article.${mdx ? 'mdx' : 'md'}`,
		OX_MARKDOWN_OPTIONS,
	);
	const media = await transformAllPlugins(transformed.html, {
		bluesky: true,
		github: false,
		mermaid: false,
		openGraph: {
			cacheDir: ogpCacheDirectory,
			persistCache: true,
			timeout: 8_000,
		},
		tabs: false,
		twitter: {
			appearance: 'full',
			cacheDir: twitterCacheDirectory,
			downloadVideo: true,
			fetch: true,
			mediaOutputDir: twitterMediaDirectory,
			mediaPublicPath: '/ox-content/twitter',
			timeZone: 'Europe/London',
		},
		youtube: true,
	});

	// Islands are rendered after every HTML transform so the link rewrites
	// cannot alter component markup that the client then hydrates.
	const body = await renderIslands(media, islands, options.renderIsland);
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

		it('leaves markdown table semantics intact for the Ox Content table enhancer', async () => {
			const html = await renderMarkdown('| Name | Value |\n|---|---:|\n| Example | 42 |');

			expect(html).toContain('<table>');
			expect(html).toContain('</table>');
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
						created_at: 'Fri Jul 04 08:52:00 +0000 2025',
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
				expect(html).toContain('data-ox-tweet-copy');
				expect(html).toContain('>Copy link</span>');
				expect(html).toContain('9:52 AM · Jul 4, 2025');
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

			expect(html).toContain('<a class="ox-not-by-ai" href="https://notbyai.fyi"');
			expect(html).toContain('aria-label="Written by human, not by AI"');
			expect(html).toContain('target="_blank" rel="noopener noreferrer"');
			expect(html).toContain('class="ox-not-by-ai__badge ox-not-by-ai__badge--light"');
			expect(html).toContain('class="ox-not-by-ai__badge ox-not-by-ai__badge--dark"');
			expect(html).not.toContain('<NotByAI');
		});

		it('renders the NotByAI badge inside callout blocks', async () => {
			const html = await renderMarkdown('> [!NOTE]\n> <NotByAI />');

			expect(html).toContain('ox-callout--note');
			expect(html).toContain('class="ox-not-by-ai__badge ox-not-by-ai__badge--light"');
		});

		it('leaves NotByAI syntax inside code fences unchanged', async () => {
			const html = await renderMarkdown('```md\n<NotByAI />\n```');

			expect(html).toContain('NotByAI');
			expect(html).not.toContain('ox-not-by-ai__badge');
		});

		it('adds accessible heading permalinks', async () => {
			const html = await renderMarkdown('# Hello World');

			expect(html).toContain(
				'<h1 id="hello-world">Hello World<a class="header-anchor" href="#hello-world" aria-label="Permalink to &#x22;Hello World&#x22;">#</a></h1>',
			);
		});

		it('preserves image alt text separately from captions', async () => {
			const html = await renderMarkdown('![A & B](./image.png "Visible caption")');

			expect(html).toContain('<img src="./image.png" alt="A &#x26; B" loading="lazy">');
			expect(html).toContain('<figcaption>Visible caption</figcaption>');
		});

		it('renders markdown attributes on links and images', async () => {
			const html = await renderMarkdown(
				'[slides](https://example.com){.text-xl}\n\n![alt](./image.png){width=480}',
			);

			expect(html).toContain(
				'<a href="https://example.com" target="_blank" rel="noopener noreferrer" class="text-xl">slides</a>',
			);
			expect(html).toContain('<img src="./image.png" alt="alt" loading="lazy" width="480">');
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

		it('applies native Ox Content BudouX segmentation', async () => {
			const html = await renderMarkdown('今日は天気です。');

			expect(html).toContain('<p>');
			expect(html).toContain('今日は\u200B天気です。');
			expect(html).not.toContain('style="word-break:keep-all;overflow-wrap:anywhere;"');
		});

		it('renders configured details containers', async () => {
			const html = await renderMarkdown('::: details More\n\n## Hidden\n\nbody\n:::');

			expect(html).toContain('<details class="ox-container ox-container--details">');
			expect(html).toContain('<summary>More</summary>');
			expect(html).toContain(
				'<h2 id="hidden">Hidden<a class="header-anchor" href="#hidden" aria-label="Permalink to &#x22;Hidden&#x22;">#</a></h2>',
			);
			expect(html).toContain('</details>');
		});
	});
}
