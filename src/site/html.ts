import type { Component } from 'svelte';
import { render } from 'svelte/server';
import Shell from './templates/Shell.svelte';

type PageOptions = {
	article?: boolean;
	assets: string;
	content: string;
	description?: string;
	pathname: string;
	title: string;
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
}: PageOptions): string {
	const { body, head } = render(Shell, {
		props: { article, content, description, pathname, title },
	});
	const theme =
		"if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark');";
	return `<!doctype html><html lang="en"><head>${head}<script>${theme}</script>${assets}</head><body>${body}</body></html>`;
}
