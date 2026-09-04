import type { SiteAssets } from '@/rendering/site-assets.ts';
import { SITE_NAME, SITE_ORIGIN, SITE_SOCIAL_IMAGE_URL } from '@/config/site.ts';
import { definePage } from '@/generation/define-page.ts';
import { SITE_OWNER } from '@/config/site-owner.ts';
import * as ufo from 'ufo';
import HomePage from './page.tsx';

const SITE_OWNER_SOURCE_PATH = 'src/config/site-owner.ts';
const HOME_DESCRIPTION = `Portfolio and technical blog of ${SITE_OWNER.name} (${SITE_OWNER.japaneseName}), known as ${SITE_OWNER.handle}, featuring open-source projects, talks, publications, and software engineering articles.`;

function homeStructuredData() {
	return {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebSite',
				'@id': ufo.withFragment(ufo.withTrailingSlash(SITE_ORIGIN), 'website'),
				name: SITE_NAME,
				alternateName: SITE_OWNER.handle,
				description: HOME_DESCRIPTION,
				url: SITE_OWNER.url,
				creator: { '@id': SITE_OWNER.id },
			},
			{
				'@type': 'ProfilePage',
				'@id': ufo.withFragment(ufo.withTrailingSlash(SITE_ORIGIN), 'profile'),
				url: SITE_OWNER.url,
				isPartOf: {
					'@id': ufo.withFragment(ufo.withTrailingSlash(SITE_ORIGIN), 'website'),
				},
				mainEntity: { '@id': SITE_OWNER.id },
			},
			{
				'@type': 'Person',
				'@id': SITE_OWNER.id,
				name: SITE_OWNER.name,
				alternateName: [
					SITE_OWNER.japaneseName,
					SITE_OWNER.formerName,
					SITE_OWNER.formerJapaneseName,
					SITE_OWNER.handle,
					'ryoppippi',
				],
				url: SITE_OWNER.url,
				image: SITE_SOCIAL_IMAGE_URL,
				sameAs: [...SITE_OWNER.sameAs],
			},
		],
	};
}

/**
 * Renders the site home page.
 *
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated home page.
 */
export function createHomePageFile(assets: SiteAssets) {
	return definePage({
		component: HomePage,
		componentProps: {},
		outputPath: 'index.html',
		sourcePaths: [SITE_OWNER_SOURCE_PATH, 'src/pages/home'],
		title: '',
		pathname: '/',
		description: HOME_DESCRIPTION,
		assets,
		style: 'home',
		structuredData: homeStructuredData(),
	});
}

if (import.meta.vitest != null) {
	test('builds the owner relationship graph', () => {
		expect(homeStructuredData()).toMatchObject({
			'@graph': expect.arrayContaining([
				expect.objectContaining({
					'@type': 'ProfilePage',
					mainEntity: { '@id': SITE_OWNER.id },
				}),
				expect.objectContaining({
					'@type': 'Person',
					'@id': SITE_OWNER.id,
					name: SITE_OWNER.name,
					sameAs: SITE_OWNER.sameAs,
				}),
			]),
		});
	});
}
