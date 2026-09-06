import {
	createMarkdownProcessor,
	transformAllPlugins,
	type MdxImport,
} from '@ox-content/vite-plugin';
import { applyReaderChromeHtml } from '@ox-content/vite-plugin/reader-chrome';
import type { SolidHtmlHostClientModule } from '@ox-content/vite-plugin-solid';
import { OPEN_GRAPH_OPTIONS } from '../config/open-graph.ts';
import {
	OX_MARKDOWN_OPTIONS,
	twitterCacheDirectory,
	twitterMediaDirectory,
} from '../config/markdown.ts';

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
