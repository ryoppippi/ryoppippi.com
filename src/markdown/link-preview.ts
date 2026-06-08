import { escapeHtml } from './html.ts';

function renderLinkPreview(url: string) {
	if (!/^https?:\/\//.test(url)) {
		return null;
	}

	try {
		const parsed = new URL(url);
		const escapedUrl = escapeHtml(url);
		return `<div class="link-preview-widget"><a href="${escapedUrl}" rel="noopener" target="_blank"><div class="link-preview-widget-title">${escapeHtml(url)}</div><div class="link-preview-widget-url">${escapeHtml(parsed.hostname)}</div></a></div>`;
	}
	catch {
		return null;
	}
}

export function replaceLinkPreviews(line: string) {
	return line.replace(/\[@preview\]\((https?:\/\/[^)\s]+)\)/g, (match, url: string) => renderLinkPreview(url) ?? match);
}

if (import.meta.vitest != null) {
	describe('replaceLinkPreviews', () => {
		it('converts preview links to link card html', () => {
			expect(replaceLinkPreviews('[@preview](https://github.com/junkawa/figma_jp)')).toBe(
				'<div class="link-preview-widget"><a href="https://github.com/junkawa/figma_jp" rel="noopener" target="_blank"><div class="link-preview-widget-title">https://github.com/junkawa/figma_jp</div><div class="link-preview-widget-url">github.com</div></a></div>',
			);
		});

		it('leaves malformed preview links untouched', () => {
			expect(replaceLinkPreviews('[@preview](https://%)')).toBe('[@preview](https://%)');
		});
	});
}
