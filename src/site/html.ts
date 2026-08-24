import type { Component } from 'svelte';
import type { PageStyle, SiteAssets } from './assets.ts';
import { render } from 'svelte/server';
import { renderAssetTags } from './assets.ts';
import type { BlogPostingJsonLd } from './head.ts';
import { renderPageHead } from './head.ts';
import Shell from './templates/Shell.svelte';

type PageOptions = {
	article?: boolean;
	alternates?: Readonly<Record<string, string>>;
	assets: SiteAssets;
	content: string;
	description?: string;
	lang?: string;
	islands?: string[];
	pathname: string;
	style: PageStyle;
	title: string;
	tweet?: boolean;
	structuredData?: BlogPostingJsonLd;
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
 * Server-renders a Svelte component and returns its body markup.
 *
 * @param component - The Svelte component to render.
 * @param props - Props accepted by the component.
 * @returns The rendered component body.
 */
export function renderComponent<Props extends Record<string, unknown>>(
	component: Component<Props>,
	props: Props,
): string {
	return render(component, { props }).body;
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
	lang = 'en',
	alternates,
	article = false,
	assets,
	islands = [],
	style,
	tweet = false,
	structuredData,
}: PageOptions): string {
	const documentLanguage = normalizedLanguage(lang);
	const body = render(Shell, {
		props: {
			content,
			pathname,
		},
	}).body;
	const head = renderPageHead({
		article,
		alternates,
		description,
		lang: documentLanguage,
		pathname,
		structuredData,
		title,
	});
	const theme =
		"document.documentElement.classList.add('js');try{const theme=localStorage.theme;document.documentElement.classList.toggle('dark',theme==='dark'||(theme!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches))}catch{document.documentElement.classList.toggle('dark',matchMedia('(prefers-color-scheme: dark)').matches)}";
	return `<!doctype html><html lang="${escapeAttribute(documentLanguage)}"><head>${head}<script>${theme}</script>${renderAssetTags(assets, style, tweet, islands)}</head><body data-page-style="${style}">${body}</body></html>`;
}
