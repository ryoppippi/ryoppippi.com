import { initIslands, readIslandSlotHtml } from '@ox-content/islands';
import type { Component } from 'svelte';

// Only published article components belong in the browser module graph.
const modules: Record<string, () => Promise<Record<string, unknown>>> = {
	'/src/content/blog/2026-07-30-uk-gtv-ja/gtv-chart/GtvChart.svelte': () =>
		import('../content/blog/2026-07-30-uk-gtv-ja/gtv-chart/GtvChart.svelte'),
};

/**
 * Loads Svelte only on pages containing islands, then applies Ox Content's load strategies.
 * @returns Resolves after the page's component registry has been prepared.
 */
export async function initialiseSvelteIslands(): Promise<void> {
	const elements = [...document.querySelectorAll<HTMLElement>('[data-ox-island]')];
	if (elements.length === 0) return;
	const ids = [...new Set(elements.map((element) => element.dataset.oxModule))];
	const results = await Promise.allSettled(
		ids.map(async (id) => {
			if (!id || !modules[id]) throw new Error(`Unregistered article island: ${id}`);
			return modules[id]();
		}),
	);
	const loaded = new Map(ids.map((id, index) => [id, results[index]]));
	const { hydrate, mount, unmount, createRawSnippet } = await import('svelte');
	const controller = initIslands((element, props) => {
		const result = loaded.get(element.dataset.oxModule);
		if (result?.status === 'rejected') throw result.reason;
		const component = (result?.status === 'fulfilled' ? result.value : undefined)?.[
			element.dataset.oxExport ?? 'default'
		];
		if (!isComponent(component))
			throw new Error(`Missing Svelte island: ${element.dataset.oxModule}`);
		const slot = readIslandSlotHtml(element);
		const instance = (element.dataset.oxSsr === 'true' ? hydrate : mount)(component, {
			target: element,
			props: {
				...props,
				...(slot
					? { children: createRawSnippet(() => ({ render: () => `<div>${slot}</div>` })) }
					: {}),
			},
		});
		return () => {
			void unmount(instance);
		};
	});
	window.addEventListener('pagehide', (event) => {
		if (!event.persisted) controller.destroy();
	});
}

function isComponent(value: unknown): value is Component<Record<string, unknown>> {
	return typeof value === 'function';
}
