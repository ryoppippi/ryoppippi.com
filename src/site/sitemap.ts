import type { GeneratedFile } from './pages.ts';

/**
 * A canonical URL and its optional source-derived modification timestamp.
 */
export type SitemapEntry = {
	loc: string;
	lastmod?: string;
};

function escapeXml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}

/**
 * Builds the XML sitemap for the generated HTML routes.
 *
 * @param entries - Canonical URLs and optional modification timestamps.
 * @returns The generated sitemap file.
 */
export function sitemap(entries: readonly SitemapEntry[]): GeneratedFile {
	return {
		path: 'sitemap.xml',
		content: `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries
			.map(
				({ loc, lastmod }) =>
					`<url><loc>${escapeXml(loc)}</loc>${lastmod == null ? '' : `<lastmod>${escapeXml(lastmod)}</lastmod>`}</url>`,
			)
			.join('')}</urlset>`,
	};
}

if (import.meta.vitest != null) {
	test('serializes source-derived modification dates when supplied', () => {
		const result = sitemap([
			{ loc: 'https://ryoppippi.com/', lastmod: '2026-08-25T10:30:00.000Z' },
			{ loc: 'https://example.com/search?q=seo&lang=en' },
		]);

		expect(result).toEqual({
			path: 'sitemap.xml',
			content:
				'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://ryoppippi.com/</loc><lastmod>2026-08-25T10:30:00.000Z</lastmod></url><url><loc>https://example.com/search?q=seo&amp;lang=en</loc></url></urlset>',
		});
		expect(result.content).toContain('<lastmod>2026-08-25T10:30:00.000Z</lastmod>');
		expect(result.content).toContain('&amp;lang=en');
	});
}
