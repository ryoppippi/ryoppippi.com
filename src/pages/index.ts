import type { SiteAssets } from '@/components/SiteLayout/assets.ts';
import { SITE_NAME, SITE_ORIGIN, SITE_SOCIAL_IMAGE_URL } from '@/config/site.ts';
import { definePage } from '@/components/SiteLayout/page.ts';
import { SITE_OWNER } from '@/config/site-owner.ts';
import * as ufo from 'ufo';
import Home from './Home.svelte';
import { createSiteIndexMarkdown } from '@/pages/llms.txt/index.ts';
import { loadOssProjects } from '@/pages/works/oss/data.ts';
import type { PageRoutes } from '@/utils/ssg/route.ts';

/** Home endpoint shared by dev and SSG. */
export const routes = (({ posts }) => [
	{ path: '/', render: ({ assets }) => createHomePageFile(assets) },
	{
		path: '/index.md',
		render: async ({ root }) => ({
			outputPath: 'index.md',
			body: createSiteIndexMarkdown({ posts, projects: await loadOssProjects(root) }),
			contentType: 'text/markdown; charset=utf-8',
		}),
	},
]) satisfies PageRoutes;

const SITE_OWNER_SOURCE_PATH = 'src/config/site-owner.ts';
const HOME_DESCRIPTION = `Portfolio and technical blog of ${SITE_OWNER.name} (${SITE_OWNER.japaneseName}), known as ${SITE_OWNER.handle} (pronounced ${SITE_OWNER.handleReading}), featuring open-source projects, talks, publications, and software engineering articles.`;

/** Builds the JSON-LD graph linking the website, its profile page, and the owner. */
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
				name: `${SITE_OWNER.name} (${SITE_OWNER.handle})`,
				description: HOME_DESCRIPTION,
				isPartOf: {
					'@id': ufo.withFragment(ufo.withTrailingSlash(SITE_ORIGIN), 'website'),
				},
				mainEntity: {
					'@type': 'Person',
					'@id': SITE_OWNER.id,
					name: SITE_OWNER.name,
					alternateName: [
						SITE_OWNER.japaneseName,
						SITE_OWNER.formerName,
						SITE_OWNER.formerJapaneseName,
						SITE_OWNER.handle,
						'ryoppippi',
						SITE_OWNER.handleReading,
						SITE_OWNER.handleReadingKatakana,
					],
					url: SITE_OWNER.url,
					image: SITE_SOCIAL_IMAGE_URL,
					jobTitle: SITE_OWNER.jobTitle,
					worksFor: { '@type': 'Organization', ...SITE_OWNER.worksFor },
					sameAs: [...SITE_OWNER.sameAs],
				},
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
		sourcePaths: [SITE_OWNER_SOURCE_PATH, 'src/pages/index.ts', 'src/pages/Home.svelte'],
		title: '',
		pathname: '/',
		description: HOME_DESCRIPTION,
		assets,
		pageModule: '/src/pages/Home.svelte',
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
					name: expect.any(String),
					description: expect.any(String),
					mainEntity: expect.objectContaining({
						'@type': 'Person',
						'@id': SITE_OWNER.id,
						name: SITE_OWNER.name,
						alternateName: expect.arrayContaining([
							SITE_OWNER.handleReading,
							SITE_OWNER.handleReadingKatakana,
						]),
						jobTitle: SITE_OWNER.jobTitle,
						sameAs: SITE_OWNER.sameAs,
					}),
				}),
			]),
		});
	});
}
