import path from 'node:path';
import { createRawSnippet, type Component } from 'svelte';
import { render } from 'svelte/server';
import {
	applyIslandSsrHtml,
	collectMdxIslandNamesFromHtml,
	resolveDocumentComponentImports,
	type MdxImport,
} from '@ox-content/vite-plugin';

/** Browser module selected by an authored island import. */
export type SvelteIslandModule = { name: string; moduleId: string; exportName: string };

/**
 * Renders authored islands through Svelte while Ox Content owns Markdown and payloads.
 * @param input - Project root and Vite's dependency-aware server module loader.
 * @returns The site's Markdown HTML adapter.
 */
export function createSvelteIslandRenderer(input: {
	root: string;
	loadModule: (id: string) => Promise<unknown>;
}) {
	return async (
		html: string,
		context: { documentPath: string; contentRoot?: string; imports?: readonly MdxImport[] },
	) => {
		const resolved = resolveDocumentComponentImports({
			...context,
			imports: context.imports ?? [],
			contentRoot: context.contentRoot ?? path.join(input.root, 'src/content'),
		});
		if (resolved.diagnostics.length)
			throw new Error(resolved.diagnostics.map(({ message }) => message).join('\n'));
		const names = collectMdxIslandNamesFromHtml(html);
		const clientModules: SvelteIslandModule[] = [];
		const heads = new Set<string>();
		const body = await applyIslandSsrHtml(
			html,
			async (name, props, _file, slotHtml) => {
				const binding = resolved.bindings.find(({ localName }) => localName === name);
				if (!binding) throw new Error(`Missing island import ${name} in ${context.documentPath}`);
				const module = await input.loadModule(binding.resolvedPath);
				if (module == null || typeof module !== 'object' || !(binding.imported in module))
					throw new Error(`Missing export ${binding.imported} in ${binding.resolvedPath}`);
				const component = Reflect.get(module, binding.imported);
				if (!isComponent(component))
					throw new Error(`Invalid Svelte component ${binding.resolvedPath}`);
				const rendered = render(component, {
					props: {
						...props,
						...(slotHtml
							? { children: createRawSnippet(() => ({ render: () => `<div>${slotHtml}</div>` })) }
							: {}),
					},
				});
				if (rendered.head) heads.add(rendered.head);
				const moduleId =
					'/' + path.relative(input.root, binding.resolvedPath).split(path.sep).join('/');
				if (!clientModules.some((item) => item.name === name))
					clientModules.push({ name, moduleId, exportName: binding.imported });
				return rendered.body;
			},
			context.documentPath,
			names,
		);
		return {
			html: body.replace(/data-ox-island="([^"]+)"/g, (attribute, name: string) => {
				const module = clientModules.find((item) => item.name === name);
				return module
					? `${attribute} data-ox-module="${escapeAttribute(module.moduleId)}" data-ox-export="${escapeAttribute(module.exportName)}"`
					: attribute;
			}),
			head: [...heads].join(''),
			clientModules,
		};
	};
}

function isComponent(value: unknown): value is Component<Record<string, unknown>> {
	return typeof value === 'function';
}

function escapeAttribute(value: string): string {
	return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}
