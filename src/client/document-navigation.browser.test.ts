import type { JSX } from '@solidjs/web';
import { mountSolidIsland } from './index.ts';

describe('document navigation', () => {
	it('preserves original slot markup when mounting an island', async () => {
		const element = document.createElement('div');
		const runtime = await import('@solidjs/web');
		const dispose = mountSolidIsland({
			component: (props: Record<string, unknown>) => props.children as JSX.Element,
			element,
			props: {},
			runtime,
			slotHtml: '<strong>slot child</strong>',
		});

		try {
			expect(element.innerHTML).toBe('<strong>slot child</strong>');
		} finally {
			dispose();
		}
	});

	it.each(['/about/', '/blog/article/#section', '/feed.xml', '/blog/article.md'])(
		'leaves %s navigation to the browser',
		(href) => {
			const link = document.createElement('a');
			link.href = href;
			document.body.append(link);
			let intercepted: boolean | undefined;
			const observe = (event: MouseEvent) => {
				intercepted = event.defaultPrevented;
				// Observe the client listeners, then keep the test document loaded.
				event.preventDefault();
			};
			document.addEventListener('click', observe, { once: true });
			try {
				link.click();
				expect(intercepted).toBe(false);
			} finally {
				link.remove();
				document.removeEventListener('click', observe);
			}
		},
	);
});
