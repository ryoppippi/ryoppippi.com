import type { GeneratedFile } from './pages.ts';

/**
 * Builds the XML sitemap for the generated HTML routes.
 *
 * @param urls - Canonical URLs to include in the sitemap.
 * @returns The generated sitemap file.
 */
export function sitemap(urls: readonly string[]): GeneratedFile {
	return {
		path: 'sitemap.xml',
		content: `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${url}</loc></url>`).join('')}</urlset>`,
	};
}

if (import.meta.vitest != null) {
	test('uses the sitemap protocol namespace without speculative modification dates', () => {
		const result = sitemap(['https://ryoppippi.com/', 'https://ryoppippi.com/blog/']);

		expect(result).toEqual({
			path: 'sitemap.xml',
			content:
				'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://ryoppippi.com/</loc></url><url><loc>https://ryoppippi.com/blog/</loc></url></urlset>',
		});
		expect(result.content).not.toContain('<lastmod>');
	});
}
