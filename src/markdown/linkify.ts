function normalizeAngleUrl(url: string) {
	return url.replace(/\(/g, '%28').replace(/\)/g, '%29');
}

export function normalizeAngleLinks(line: string) {
	return line
		.replace(/\[([^\]]+)\]\(<(https?:\/\/[^>\s]+)>\)/g, (_match, label: string, url: string) => `[${label}](${normalizeAngleUrl(url)})`)
		.replace(/<(https?:\/\/[^>\s]+)>/g, (_match, url: string) => `[${url}](${normalizeAngleUrl(url)})`);
}

const trailingBareUrlPunctuationPattern = /[),.:;!?]+$/;

function shouldTrimTrailingBareUrlPunctuation(url: string) {
	const last = url.at(-1);
	if (last == null) {
		return false;
	}

	if (last !== ')') {
		return trailingBareUrlPunctuationPattern.test(last);
	}

	const openingParens = (url.match(/\(/g) ?? []).length;
	const closingParens = (url.match(/\)/g) ?? []).length;
	return closingParens > openingParens;
}

function normaliseBareUrlLink(url: string) {
	let linkUrl = url;
	let trailingPunctuation = '';

	while (shouldTrimTrailingBareUrlPunctuation(linkUrl)) {
		trailingPunctuation = `${linkUrl.at(-1)}${trailingPunctuation}`;
		linkUrl = linkUrl.slice(0, -1);
	}

	const normalisedLinkUrl = normalizeAngleUrl(linkUrl);
	return `[${linkUrl}](${normalisedLinkUrl})${trailingPunctuation}`;
}

export function replaceBareUrls(line: string) {
	if (line.includes('`') || line.includes('<') || line.includes('](')) {
		return line;
	}

	return line.replace(/(^|[\s([>])(https?:\/\/[^\s<]+)/g, (_match, prefix: string, url: string) => {
		return `${prefix}${normaliseBareUrlLink(url)}`;
	});
}

if (import.meta.vitest != null) {
	describe('normalizeAngleLinks', () => {
		it('normalises angle links that contain parentheses', () => {
			expect(normalizeAngleLinks('[release](<https://example.com/a(1)>)')).toBe(
				'[release](https://example.com/a%281%29)',
			);
		});

		it('normalises bare angle links that contain parentheses', () => {
			expect(normalizeAngleLinks('<https://example.com/a(1)>')).toBe(
				'[https://example.com/a(1)](https://example.com/a%281%29)',
			);
		});
	});

	describe('replaceBareUrls', () => {
		it('converts bare URLs to markdown links', () => {
			expect(replaceBareUrls('> https://example.com/a(1).')).toBe(
				'> [https://example.com/a(1)](https://example.com/a%281%29).',
			);
		});

		it('leaves existing markdown links untouched', () => {
			expect(replaceBareUrls('[site](https://example.com)')).toBe('[site](https://example.com)');
		});
	});
}
