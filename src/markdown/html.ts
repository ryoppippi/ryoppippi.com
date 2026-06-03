export function escapeHtml(value: string) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

export function addExternalLinkAttributes(html: string) {
	return html.replace(/<a href="(https?:\/\/[^"]*)"([^>]*)>/g, (_match, href: string, attrs: string) => {
		let resolvedAttrs = attrs;

		if (!/\starget=/.test(resolvedAttrs)) {
			resolvedAttrs += ' target="_blank"';
		}

		const relMatch = resolvedAttrs.match(/\srel=(["'])(.*?)\1/);

		if (relMatch == null) {
			resolvedAttrs += ' rel="noopener"';
		}
		else {
			const relValues = relMatch[2].split(/\s+/).filter(Boolean);
			if (!relValues.includes('noopener')) {
				resolvedAttrs = resolvedAttrs.replace(relMatch[0], ` rel=${relMatch[1]}${['noopener', ...relValues].join(' ')}${relMatch[1]}`);
			}
		}

		return `<a href="${href}"${resolvedAttrs}>`;
	});
}

if (import.meta.vitest != null) {
	describe('addExternalLinkAttributes', () => {
		it('adds target and rel to external links', () => {
			expect(addExternalLinkAttributes('<a href="https://example.com">external</a>')).toBe(
				'<a href="https://example.com" target="_blank" rel="noopener">external</a>',
			);
		});

		it('adds noopener when target already exists without rel', () => {
			expect(addExternalLinkAttributes('<a href="https://example.com" target="_blank">external</a>')).toBe(
				'<a href="https://example.com" target="_blank" rel="noopener">external</a>',
			);
		});

		it('preserves existing rel values while adding noopener', () => {
			expect(addExternalLinkAttributes('<a href="https://example.com" rel="noreferrer">external</a>')).toBe(
				'<a href="https://example.com" rel="noopener noreferrer" target="_blank">external</a>',
			);
		});
	});
}
