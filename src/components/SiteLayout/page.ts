import type { Component } from 'svelte';
import type { OxContentCustomHostRenderResult } from '@ox-content/vite-plugin/custom-host';
import { render } from 'svelte/server';
import { renderHtmlDocument } from '@/components/SiteLayout/document.ts';

type HtmlDocumentOptions = Parameters<typeof renderHtmlDocument>[0];

type DefinePageOptions<Props extends object> = Omit<HtmlDocumentOptions, 'content'> & {
	component: Component<Props>;
	componentProps: Props;
	outputPath: string;
	sourcePaths?: readonly string[];
};

/**
 * Defines a generated HTML page from a Svelte component and its document metadata.
 *
 * @param options - Component, output location, metadata, and assets for the page.
 * @returns The generated HTML file.
 */
export function definePage<Props extends object>({
	component,
	componentProps,
	outputPath,
	sourcePaths,
	...documentOptions
}: DefinePageOptions<Props>) {
	const [inputPath, ...lastUpdatedPaths] = sourcePaths ?? [];
	const rendered = render(component, { props: componentProps });
	return {
		outputPath,
		inputPath,
		lastUpdatedPaths,
		contentType: 'text/html; charset=utf-8',
		unlisted: documentOptions.indexable === false,
		body: renderHtmlDocument({
			...documentOptions,
			content: rendered.body,
			componentHead: [rendered.head, documentOptions.componentHead].filter(Boolean).join(''),
		}),
	} satisfies OxContentCustomHostRenderResult;
}
