import type { SiteAssets } from '../site/assets.ts';
import * as ufo from 'ufo';
import { SITE_NAME, SITE_ORIGIN, SITE_SOCIAL_IMAGE_URL } from '../site/consts.ts';
import { page, renderComponent } from '../site/html.ts';
import { SITE_OWNER } from '../site/site-owner.ts';
import Home from '../site/templates/Home.tsx';

const SITE_OWNER_SOURCE_PATH = 'src/site/site-owner.ts';
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
 * A file emitted by the static site generator.
 */
export type GeneratedFile = {
	/** Relative path below the generated site directory. */
	path: string;
	/** Serialized file contents. */
	content: string;
	/** Repository paths whose meaningful changes update the generated file. */
	sourcePaths?: readonly string[];
};

/**
 * Renders the site home page.
 *
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated home page.
 */
export function homePage(assets: SiteAssets): GeneratedFile {
	return {
		path: 'index.html',
		sourcePaths: [SITE_OWNER_SOURCE_PATH, 'src/site/templates/Home.tsx'],
		content: page({
			title: '',
			pathname: '/',
			content: renderComponent(Home, {}),
			description: HOME_DESCRIPTION,
			assets,
			style: 'home',
			structuredData: homeStructuredData(),
		}),
	};
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
