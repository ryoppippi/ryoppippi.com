import {
	createMarkdownProcessor,
	transformAllPlugins,
	type MdxImport,
	type OxContentOptions,
} from '@ox-content/vite-plugin';
import { applyReaderChromeHtml } from '@ox-content/vite-plugin/reader-chrome';
import path from 'node:path';
import type { SolidHtmlHostClientModule } from '@ox-content/vite-plugin-solid';
import { OPEN_GRAPH_OPTIONS } from './open-graph.ts';

const workspaceDirectory = path.resolve(import.meta.dirname, '../../..');
const twitterCacheDirectory = path.join(workspaceDirectory, '.cache/ox-content/twitter');
const twitterMediaDirectory = path.join(workspaceDirectory, 'public/ox-content/twitter');

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

const markdownProcessor = createMarkdownProcessor(OX_MARKDOWN_OPTIONS);

/**
 * Renders post-colocated components into HTML so their islands are present before
 * any JavaScript runs.
 *
 * Implemented by callers that have a Vite SSR loader because a Solid `.tsx`
 * file has to be compiled before it can be rendered.
 */
export type RenderedMarkdown = {
	html: string;
	clientModules: readonly SolidHtmlHostClientModule[];
};

/** Document context required to resolve MDX-local Solid imports. */
export type IslandRenderContext = {
	/** Root directory that document-local imports may not escape. */
	contentRoot?: string;
	/** Real source path used to resolve relative imports. */
	documentPath: string;
	/** Imports already collected by the Ox Content Markdown transform. */
	imports: readonly MdxImport[];
};

export type IslandRenderer = (
	html: string,
	context: IslandRenderContext,
) => Promise<RenderedMarkdown>;

/** Options for rendering a Markdown or MDX document into the site article body. */
export type RenderMarkdownOptions = {
	/** Root directory that document-local imports may not escape. */
	contentRoot?: string;
	/** Real source path used to resolve document-local imports. */
	documentPath?: string;
	/** Whether Ox Content should parse MDX syntax for this document. */
	mdx?: boolean;
	renderIsland?: IslandRenderer;
};

/** A Markdown renderer whose island loader is supplied by the host. */
export type MarkdownRenderer = (
	content: string,
	options?: Omit<RenderMarkdownOptions, 'renderIsland'>,
) => Promise<RenderedMarkdown>;

/**
 * Renders Markdown with Ox Content and the site's post-render transforms.
 *
 * @param content - Markdown or MDX source text.
 * @param options - Document-specific island and parser options.
 * @returns The rendered article HTML and its client module metadata.
 */
export async function renderMarkdown(
	content: string,
	options: RenderMarkdownOptions = {},
): Promise<RenderedMarkdown> {
	const mdx = options.mdx ?? false;
	const documentPath = options.documentPath ?? `/virtual/article.${mdx ? 'mdx' : 'md'}`;
	const transformed = await markdownProcessor.render(content, documentPath);
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
	const body = applyReaderChromeHtml(media, {
		backToTop: false,
		copy: true,
		externalLinks: false,
	});
	return options.renderIsland == null
		? { html: body, clientModules: [] }
		: options.renderIsland(body, {
				contentRoot: options.contentRoot,
				documentPath,
				imports: transformed.imports,
			});
}
