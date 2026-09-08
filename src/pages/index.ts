import type { SiteAssets } from '@/components/SiteLayout/assets.ts';
import { SITE_NAME, SITE_ORIGIN, SITE_SOCIAL_IMAGE_URL } from '@/config/site.ts';
import { definePage } from '@/components/SiteLayout/page.ts';
import { SITE_OWNER } from '@/config/site-owner.ts';
import * as ufo from 'ufo';
import Home from './Home.tsx';
import type { PageRoutes } from '@/utils/ssg/route.ts';

/** Home endpoint shared by dev and SSG. */
export const routes = (() => [
	{ path: '/', render: ({ assets }) => createHomePageFile(assets) },
]) satisfies PageRoutes;

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
		component: Home,
		componentProps: {},
		outputPath: 'index.html',
		sourcePaths: [
			SITE_OWNER_SOURCE_PATH,
			'src/pages/index.ts',
			'src/pages/Home.tsx',
			'src/pages/Home.module.css',
		],
		title: '',
		pathname: '/',
		description: HOME_DESCRIPTION,
		assets,
		pageModule: '/src/pages/Home.tsx',
		style: '.',
		structuredData: homeStructuredData(),
	});
}

if (import.meta.vitest != null) {
	test('builds the owner relationship graph', () => {
		const page = createHomePageFile({
			sharedStyles: [],
			scripts: [],
			islands: {},
			selfHosted: {},
			pageStyles: () => [],
		});
		const jsonLd = page.body.match(
			/<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
		)?.[1];
		assert.isDefined(jsonLd);
		expect(JSON.parse(jsonLd)).toMatchObject({
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
