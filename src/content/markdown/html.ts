/**
 * Escapes text for safe insertion into HTML content or attributes.
 *
 * @param value - Untrusted text to escape.
 * @returns The HTML-escaped text.
 */
export function escapeHtml(value: string) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

if (import.meta.vitest != null) {
	describe(escapeHtml, () => {
		it('escapes HTML content and attribute delimiters', () => {
			expect(escapeHtml(`<a href="x">&'</a>`)).toBe(
				'&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;',
			);
		});
	});
}
