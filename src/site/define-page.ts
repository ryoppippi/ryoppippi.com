import type { Component } from 'solid-js';
import type { GeneratedFile } from './generated-file.ts';
import { renderComponent, renderHtmlDocument } from './html.ts';

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
}: DefinePageOptions<Props>): GeneratedFile {
	return {
		path: outputPath,
		sourcePaths,
		content: renderHtmlDocument({
			...documentOptions,
			content: renderComponent(component, componentProps),
		}),
	};
}
