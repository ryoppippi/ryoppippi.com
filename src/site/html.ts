import type { Component } from 'svelte';
import type { PageStyle, SiteAssets } from './assets.ts';
import { render } from 'svelte/server';
import { renderAssetTags } from './assets.ts';
import Shell from './templates/Shell.svelte';

type PageOptions = {
	article?: boolean;
	assets: SiteAssets;
	content: string;
	description?: string;
	pathname: string;
	style: PageStyle;
	title: string;
	tweet?: boolean;
};

export function renderComponent<Props extends Record<string, unknown>>(
	component: Component<Props>,
	props: Props,
): string {
	return render(component, { props }).body;
}

export function page({
	title,
	pathname,
	content,
	description = 'Portfolio of @ryoppippi',
	article = false,
	assets,
	style,
	tweet = false,
}: PageOptions): string {
	const { body, head } = render(Shell, {
		props: { article, content, description, pathname, title },
	});
	const theme =
		"document.documentElement.classList.add('js');try{const theme=localStorage.theme;document.documentElement.classList.toggle('dark',theme==='dark'||(theme!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches))}catch{document.documentElement.classList.toggle('dark',matchMedia('(prefers-color-scheme: dark)').matches)}";
	return `<!doctype html><html lang="en"><head>${head}<script>${theme}</script>${renderAssetTags(assets, style, tweet)}</head><body data-page-style="${style}">${body}</body></html>`;
}
