import { render } from 'svelte/server';
import GtvChart from './content/blog/2026-07-30-uk-gtv-ja/gtv-chart/GtvChart.svelte';
import BlogList from './pages/blog/BlogList.svelte';

describe('Svelte server rendering through rsvelte', () => {
	it.each(['ja', 'en'] as const)('renders the %s chart and evidence before hydration', (lang) => {
		const { body } = render(GtvChart, { props: { lang } });

		expect(body.match(/data-testid="gtv-chart"/g)).toHaveLength(1);
		expect(body.match(/data-testid="gtv-row"/g)).toHaveLength(18);
		expect(body.match(/<svg\b/g)).toHaveLength(1);
		expect(body).toContain('aria-live="polite"');
		expect(body).toContain(lang === 'en' ? 'Central estimate (left axis)' : '中央推定（左軸）');
	});

	it('escapes post titles while retaining filter attributes and external link protection', () => {
		const { body } = render(BlogList, {
			props: {
				items: [
					{
						title: '<script>alert("title")</script>',
						slug: 'external-video',
						link: 'https://example.com/video',
						pubDate: '2026-09-09T00:00:00Z',
						lang: 'en',
						external: true,
						kind: 'video',
					},
				],
			},
		});

		expect(body).not.toContain('<script>');
		expect(body).toContain('&lt;script>');
		expect(body).toContain('data-origin="external"');
		expect(body).toContain('data-lang="en"');
		expect(body).toContain('data-kind="video"');
		expect(body).toContain('rel="noopener noreferrer"');
	});
});
