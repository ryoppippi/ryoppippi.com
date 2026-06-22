import { escapeHtml } from './html.ts';

function renderImageFigure(alt: string, src: string, title: string) {
	return `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" title="${escapeHtml(title)}" loading="lazy" decoding="async"><figcaption>${escapeHtml(title)}</figcaption></figure>`;
}

export function replaceImageFigures(line: string) {
	return line.replace(
		/!\[([^\]]*)\]\((\S+)\s+(['"])(.*?)\3\)(?:\{[^}\n]+\})?/g,
		(_match, alt: string, src: string, _quote: string, title: string) =>
			renderImageFigure(alt, src, title),
	);
}

if (import.meta.vitest != null) {
	describe('replaceImageFigures', () => {
		it('converts markdown images with title attributes to image figures', () => {
			expect(replaceImageFigures('![alt](./image.png "caption"){width=480}')).toBe(
				'<figure><img src="./image.png" alt="alt" title="caption" loading="lazy" decoding="async"><figcaption>caption</figcaption></figure>',
			);
		});
	});
}
