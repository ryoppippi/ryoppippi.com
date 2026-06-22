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
		"document.documentElement.classList.add('js');try{const theme=localStorage.theme;document.documentElement.classList.toggle('dark',theme==='dark'||(theme!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches))}catch{document.documentElement.classList.toggle('dark',matchMedia('(prefers-color-scheme: dark)').matches)}";
	return `<!doctype html><html lang="en"><head>${head}<script>${theme}</script>${assets}</head><body>${body}</body></html>`;
}
