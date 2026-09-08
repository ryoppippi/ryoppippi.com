import type { Component } from 'solid-js';
import type { OxContentCustomHostRenderResult } from '@ox-content/vite-plugin/custom-host';
import { renderToString } from '@solidjs/web';
import { renderHtmlDocument } from '@/components/SiteLayout/document.ts';

type HtmlDocumentOptions = Parameters<typeof renderHtmlDocument>[0];

type DefinePageOptions<Props extends object> = Omit<HtmlDocumentOptions, 'content'> & {
	component: Component<Props>;
	componentProps: Props;
	outputPath: string;
	sourcePaths?: readonly string[];
};

/**
 * Defines a generated HTML page from a Solid component and its document metadata.
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
	return {
		outputPath,
		inputPath,
		lastUpdatedPaths,
		contentType: 'text/html; charset=utf-8',
		unlisted: documentOptions.indexable === false,
		body: renderHtmlDocument({
			...documentOptions,
			content: renderToString(() => component(componentProps)),
		}),
	} satisfies OxContentCustomHostRenderResult;
}
