import { escapeHtml } from './html.ts';

const linkPreviewPattern = /\[@preview\]\((https?:\/\/[^)\s]+)\)/g;

export function replaceLinkPreviews(line: string) {
	return line.replace(linkPreviewPattern, (match, url: string) => {
		try {
			new URL(url);
			return `<OgCard url="${escapeHtml(url)}" />`;
		} catch {
			return match;
		}
	});
}

if (import.meta.vitest != null) {
	describe('replaceLinkPreviews', () => {
		it('converts preview links to open graph embeds', () => {
			expect(replaceLinkPreviews('[@preview](https://example.com/post)')).toBe(
				'<OgCard url="https://example.com/post" />',
			);
		});

		it('leaves malformed preview links untouched', () => {
			expect(replaceLinkPreviews('[@preview](https://%)')).toBe('[@preview](https://%)');
		});
	});
}
