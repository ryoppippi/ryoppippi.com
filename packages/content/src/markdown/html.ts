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

function decodeNumericEntity(match: string, hex: string | undefined, decimal: string | undefined) {
	const code = hex != null ? Number.parseInt(hex, 16) : Number.parseInt(decimal ?? '', 10);
	return Number.isNaN(code) ? match : String.fromCodePoint(code);
}

/**
 * Reverses HTML escaping so an attribute value can be read back.
 *
 * Numeric quote entities emitted by HTML pipelines are decoded as well.
 * Ampersands are decoded last so a nested escaped entity remains literal.
 *
 * @param value - Text that was escaped for an HTML attribute.
 * @returns The original text.
 * @example
 * unescapeHtml('{&quot;a&quot;:1}'); // '{"a":1}'
 */
export function unescapeHtml(value: string) {
	return value
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&#x([0-9a-f]+);/gi, (match, hex: string) =>
			decodeNumericEntity(match, hex, undefined),
		)
		.replace(/&#(\d+);/g, (match, decimal: string) =>
			decodeNumericEntity(match, undefined, decimal),
		)
		.replace(/&amp;/g, '&');
}

if (import.meta.vitest != null) {
	describe(unescapeHtml, () => {
		it('round-trips escaped values', () => {
			const value = `<a href="x">&'</a>`;

			expect(unescapeHtml(escapeHtml(value))).toBe(value);
		});

		it('does not decode an entity that was itself escaped', () => {
			expect(unescapeHtml(escapeHtml('&quot;'))).toBe('&quot;');
		});

		it('decodes numeric quote entities used by the HTML pipeline', () => {
			expect(unescapeHtml('{&#x22;lang&#x22;:&#x22;en&#x22;}')).toBe('{"lang":"en"}');
			expect(unescapeHtml('{&#34;lang&#34;:&#34;en&#34;}')).toBe('{"lang":"en"}');
		});
	});
}
