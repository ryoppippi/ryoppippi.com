describe('document navigation', () => {
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
			link.click();
			link.remove();

			expect(intercepted).toBe(false);
		},
	);
});
