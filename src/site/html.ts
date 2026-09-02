import type { Component } from 'solid-js';
import type { PageStyle, SiteAssets } from './assets.ts';
import type { StructuredData } from './head.ts';
import { renderToString } from '@solidjs/web';
import { renderAssetTags } from './assets.ts';
import { renderPageHead } from './head.ts';
import Shell from './components/Shell/index.tsx';

type PageOptions = {
	article?: boolean;
	alternates?: Readonly<Record<string, string>>;
	assets: SiteAssets;
	content: string;
	datePublished?: string;
	description?: string;
	indexable?: boolean;
	lang?: string;
	islands?: string[];
	pathname: string;
	style: PageStyle;
	title: string;
	structuredData?: StructuredData;
};

function normalizedLanguage(value: string | undefined): string {
	return value?.trim() || 'en';
}

function escapeAttribute(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('"', '&quot;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;');
}

/**
 * Server-renders a Solid component and returns its body markup.
 *
 * @param component - The Solid component to render.
 * @param props - Props accepted by the component.
 * @returns The rendered component body.
 */
export function renderComponent<Props extends object>(
	component: Component<Props>,
	props: Props,
): string {
	return renderToString(() => component(props));
}

/**
 * Renders a complete static HTML document with shared metadata and assets.
 *
 * @param options - Document content, metadata, and assets.
 * @returns A complete HTML document.
 */
export function page({
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
	style,
	structuredData,
}: PageOptions): string {
	const documentLanguage = normalizedLanguage(lang);
	const body = renderComponent(Shell, { content, pathname });
	const head = renderPageHead({
		article,
		alternates,
		datePublished,
		description,
		indexable,
		lang: documentLanguage,
		pathname,
		structuredData,
		title,
	});
	const theme =
		"document.documentElement.classList.add('js');const applyTheme=dark=>{document.documentElement.classList.toggle('dark',dark);document.documentElement.dataset.theme=dark?'dark':'light'};try{const theme=localStorage.theme;applyTheme(theme==='dark'||(theme!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches))}catch{applyTheme(matchMedia('(prefers-color-scheme: dark)').matches)}";
	return `<!doctype html><html lang="${escapeAttribute(documentLanguage)}"><head>${head}<script>${theme}</script>${renderAssetTags(assets, style, islands)}</head><body data-page-style="${style}">${body}</body></html>`;
}
