import type { SiteAssets } from './assets.ts';
import type { GeneratedFile } from './pages.ts';
import { page, renderComponent } from './html.ts';
import { author, authorStructuredData } from './author.ts';
import About from './templates/About.svelte';

const description =
	'木村亮太朗（Ryotaro Kimura / @ryoppippi）のプロフィール。ccusageやSiteMCPなどを開発するソフトウェアエンジニア・OSS開発者です。';

/**
 * Renders the author profile page and its Person structured data.
 *
 * @param assets - Site assets used by the profile page.
 * @returns The generated About page.
 */
export function aboutPage(assets: SiteAssets): GeneratedFile {
	return {
		path: 'about/index.html',
		content: page({
			title: `${author.japaneseName} / ${author.name}`,
			pathname: '/about/',
			content: renderComponent(About, {}),
			description,
			lang: 'ja',
			assets,
			style: 'about',
			structuredData: {
				'@context': 'https://schema.org',
				'@type': 'ProfilePage',
				'@id': `${author.pageUrl}#profile`,
				url: author.pageUrl,
				mainEntity: authorStructuredData,
			},
		}),
	};
}

if (import.meta.vitest != null) {
	const assets = {
		base: '',
		client: '',
		islands: {},
		pages: { about: '', article: '', blog: '', error: '', home: '', sponsors: '', works: '' },
		tweet: '',
	} as const satisfies SiteAssets;

	test('renders a visible bilingual identity and matching ProfilePage data', () => {
		const generated = aboutPage(assets);
		const jsonLd = generated.content.match(
			/<script data-page-head type="application\/ld\+json">([\s\S]*?)<\/script>/,
		)?.[1];

		expect(generated.path).toBe('about/index.html');
		expect(generated.content).toContain('<html lang="ja">');
		expect(generated.content).toContain(author.japaneseName);
		expect(generated.content).toContain(author.name);
		expect(generated.content).toContain('view-transition-name---profile');
		expect(JSON.parse(jsonLd ?? '')).toMatchObject({
			'@context': 'https://schema.org',
			'@type': 'ProfilePage',
			url: author.pageUrl,
			mainEntity: {
				'@type': 'Person',
				'@id': author.id,
				name: author.name,
				alternateName: [author.japaneseName, author.handle],
				url: author.pageUrl,
			},
		});
	});
}
