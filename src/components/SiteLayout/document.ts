import type { DocumentLinkInput } from '@ox-content/vite-plugin/document-assets';
import type { SiteAssets } from './assets.ts';
import type { StructuredData } from './head.ts';
import { escape, renderToString } from '@solidjs/web';
import { renderThemeBootstrapScript } from '@ox-content/vite-plugin/theme-bootstrap';
import { renderAssetTags } from './assets.ts';
import { renderPageHead } from './head.ts';
import SiteLayout from '@/components/SiteLayout';

type HtmlDocumentOptions = {
	article?: boolean;
	alternates?: Readonly<Record<string, string>>;
	assets: SiteAssets;
	content: string;
	datePublished?: string;
	description?: string;
	indexable?: boolean;
	lang?: string;
	islands?: string[];
	links?: readonly DocumentLinkInput[];
	pathname: string;
	pageModule: string;
	style: string;
	title: string;
	structuredData?: StructuredData;
};

const JAVASCRIPT_CLASS_SCRIPT = "<script>document.documentElement.classList.add('js')</script>";

/**
 * Renders a complete static HTML document with shared metadata and assets.
 *
 * @param options - Document content, metadata, and assets.
 * @returns A complete HTML document.
 */
export function renderHtmlDocument({
	title,
	pathname,
	content,
	description = 'Portfolio of @ryoppippi',
	datePublished,
	indexable = true,
	lang = 'en',
	alternates,
	article = false,
	assets,
	islands = [],
	links = [],
	pageModule,
	style,
	structuredData,
}: HtmlDocumentOptions): string {
	const documentLanguage = lang.trim() || 'en';
	const body = renderToString(() => SiteLayout({ content, pathname }));
	const head = [
		renderPageHead({
			article,
			alternates,
			datePublished,
			description,
			indexable,
			lang: documentLanguage,
			pathname,
			structuredData,
			title,
		}),
		JAVASCRIPT_CLASS_SCRIPT,
		renderThemeBootstrapScript(),
		renderAssetTags(assets, style, pageModule, islands, links),
	].join('');

	return [
		'<!doctype html>',
		`<html lang="${escape(documentLanguage, true)}">`,
		`<head>${head}</head>`,
		`<body data-page-style="${escape(style, true)}">${body}</body>`,
		'</html>',
	].join('');
}
