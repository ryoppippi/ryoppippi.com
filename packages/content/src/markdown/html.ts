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
 * Reverses {@link escapeHtml} so values round-tripped through an attribute can
 * be read back.
 *
 * Markdown/HTML pipelines may rewrite `&quot;` to `&#x22;` or `&#34;`. Those
 * numeric forms are decoded as well. `&amp;` is decoded last so an escaped
 * entity such as `&amp;quot;` survives as the literal text `&quot;` instead of
 * becoming a quote character.
 *
 * @param value - Text that was escaped for an HTML attribute.
 * @returns The original text.
 * @example
 * unescapeHtml('{&quot;a&quot;:1}'); // '{"a":1}'
 * unescapeHtml('{&#x22;a&#x22;:1}'); // '{"a":1}'
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

export function addExternalLinkAttributes(html: string) {
	return html.replace(
		/<a href="(https?:\/\/[^"]*)"([^>]*)>/g,
		(_match, href: string, attrs: string) => {
			let resolvedAttrs = attrs;

			if (!/\starget=/.test(resolvedAttrs)) {
				resolvedAttrs += ' target="_blank"';
			}

			const relMatch = resolvedAttrs.match(/\srel=(["'])(.*?)\1/);

			if (relMatch == null) {
				resolvedAttrs += ' rel="noopener"';
			} else {
				const relValues = relMatch[2].split(/\s+/).filter(Boolean);
				if (!relValues.includes('noopener')) {
					resolvedAttrs = resolvedAttrs.replace(
						relMatch[0],
						` rel=${relMatch[1]}${['noopener', ...relValues].join(' ')}${relMatch[1]}`,
					);
				}
			}

			return `<a href="${href}"${resolvedAttrs}>`;
		},
	);
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

	describe('addExternalLinkAttributes', () => {
		it('adds target and rel to external links', () => {
			expect(addExternalLinkAttributes('<a href="https://example.com">external</a>')).toBe(
				'<a href="https://example.com" target="_blank" rel="noopener">external</a>',
			);
		});

		it('adds noopener when target already exists without rel', () => {
			expect(
				addExternalLinkAttributes('<a href="https://example.com" target="_blank">external</a>'),
			).toBe('<a href="https://example.com" target="_blank" rel="noopener">external</a>');
		});

		it('preserves existing rel values while adding noopener', () => {
			expect(
				addExternalLinkAttributes('<a href="https://example.com" rel="noreferrer">external</a>'),
			).toBe(
				'<a href="https://example.com" rel="noopener noreferrer" target="_blank">external</a>',
			);
		});
	});
}
