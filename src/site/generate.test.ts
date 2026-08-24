import { sitemap } from './generate.ts';

describe(sitemap, () => {
	it('uses the sitemap protocol namespace without speculative modification dates', () => {
		const result = sitemap(['https://ryoppippi.com/', 'https://ryoppippi.com/blog/']);

		expect(result).toEqual({
			path: 'sitemap.xml',
			content:
				'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://ryoppippi.com/</loc></url><url><loc>https://ryoppippi.com/blog/</loc></url></urlset>',
		});
		expect(result.content).not.toContain('<lastmod>');
	});
});
