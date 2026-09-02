import {
	applyIslandSsrHtml,
	renderMarkdown as renderOxMarkdown,
	transformAllPlugins,
	type OxContentOptions,
	type OgpOptions,
} from '@ox-content/vite-plugin';
import { applyReaderChromeHtml } from '@ox-content/vite-plugin/reader-chrome';
import path from 'node:path';
import type { BlogIslandSsrRenderer } from './index.ts';

const workspaceDirectory = path.resolve(import.meta.dirname, '../../..');
const twitterCacheDirectory = path.join(workspaceDirectory, '.cache/ox-content/twitter');
const twitterMediaDirectory = path.join(workspaceDirectory, 'static/ox-content/twitter');

export const OPEN_GRAPH_OPTIONS = {
	cacheDir: path.join(workspaceDirectory, '.cache/ox-content/ogp'),
	persistCache: true,
	timeout: 8_000,
} as const satisfies OgpOptions;

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

/** Options for rendering a Markdown or MDX document into the site article body. */
export type ContentMarkdownRenderOptions = {
	/** Component names available to this document, mapped to their module ids. */
	islands?: Record<string, string>;
	/** Whether Ox Content should parse MDX syntax for this document. */
	mdx?: boolean;
	/** Optional site adapter for server-rendering document-local Solid islands. */
	islandSsr?: BlogIslandSsrRenderer;
};

/** A Markdown renderer whose island loader is supplied by the host. */
export type ContentMarkdownRenderer = (
	content: string,
	options?: Omit<ContentMarkdownRenderOptions, 'islandSsr'>,
) => Promise<string>;

function escapeHtmlAttribute(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

async function renderBlogIslands(
	html: string,
	islands: Record<string, string>,
	islandSsr: BlogIslandSsrRenderer | undefined,
) {
	const names = Object.keys(islands);
	const rendered =
		islandSsr == null
			? html
			: await applyIslandSsrHtml(
					html,
					async (name, props) => {
						const body = await islandSsr(islands[name], props);
						return body == null ? '' : `<div data-ox-island-root>${body}</div>`;
					},
					'/virtual/article.mdx',
					names,
				);

	return names.reduce(
		(output, name) =>
			output.replaceAll(
				`data-ox-island="${escapeHtmlAttribute(name)}"`,
				`data-ox-island="${escapeHtmlAttribute(islands[name])}"`,
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
export async function renderContentMarkdown(
	content: string,
	options: ContentMarkdownRenderOptions = {},
) {
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
		openGraph: OPEN_GRAPH_OPTIONS,
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
	const body = await renderBlogIslands(
		applyReaderChromeHtml(media, {
			backToTop: false,
			copy: true,
			externalLinks: false,
		}),
		islands,
		options.islandSsr,
	);
	return body;
}
