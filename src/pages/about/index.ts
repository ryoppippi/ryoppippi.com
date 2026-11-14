import type { SiteAssets } from '@/components/SiteLayout/assets.ts';
import { SITE_ORIGIN } from '@/config/site.ts';
import { definePage } from '@/components/SiteLayout/page.ts';
import { SITE_OWNER } from '@/config/site-owner.ts';
import * as ufo from 'ufo';
import About from './About.svelte';
import type { PageRoutes } from '@/utils/ssg/route.ts';

/** Profile endpoint shared by dev and SSG. */
export const routes = (() => [
	{ path: '/about/', render: ({ assets }) => createAboutPageFile(assets) },
	{
		path: '/about.md',
		render: () => ({
			outputPath: 'about.md',
			body: createAboutMarkdown(),
			contentType: 'text/markdown; charset=utf-8',
		}),
	},
]) satisfies PageRoutes;

const ABOUT_PATHNAME = '/about/';
const ABOUT_TITLE = 'about';
const ABOUT_PROFILE_NAME = 'ryoppippi (Ryotaro Kimura)';
const ABOUT_DESCRIPTION = `${SITE_OWNER.name} (${SITE_OWNER.japaneseName}), known as ryoppippi (pronounced ${SITE_OWNER.handleReading}), builds developer tools, maintains ccusage and open-source projects, and is a Founding Engineer at Rork.`;

/** Renders the profile as Markdown for agents that negotiate `Accept: text/markdown`. */
export function createAboutMarkdown(): string {
	return `# ${ABOUT_PROFILE_NAME}

${ABOUT_DESCRIPTION}

- Name: ${SITE_OWNER.name} (${SITE_OWNER.japaneseName}); formerly ${SITE_OWNER.formerName} (${SITE_OWNER.formerJapaneseName})
- Handle: ${SITE_OWNER.handle}, pronounced ${SITE_OWNER.handleReading} (${SITE_OWNER.handleReadingKatakana})
- Role: ${SITE_OWNER.jobTitle} at [${SITE_OWNER.worksFor.name}](${SITE_OWNER.worksFor.url})
- Open-source projects: ${ufo.joinURL(SITE_ORIGIN, '/works/oss/')}

## Profiles

${SITE_OWNER.sameAs.map((link) => `- ${link}`).join('\n')}
`;
}

/**
 * Renders the site owner's profile page.
 *
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated About page.
 */
export function createAboutPageFile(assets: SiteAssets) {
	const url = ufo.joinURL(SITE_ORIGIN, ABOUT_PATHNAME);
	return definePage({
		component: About,
		componentProps: {},
		outputPath: 'about/index.html',
		sourcePaths: ['src/config/site-owner.ts', 'src/pages/about'],
		title: ABOUT_TITLE,
		pathname: ABOUT_PATHNAME,
		description: ABOUT_DESCRIPTION,
		assets,
		pageModule: '/src/pages/about/About.svelte',
		style: 'about',
		structuredData: {
			'@context': 'https://schema.org',
			'@type': 'ProfilePage',
			'@id': ufo.withFragment(url, 'profile'),
			url,
			name: ABOUT_PROFILE_NAME,
			description: ABOUT_DESCRIPTION,
			mainEntity: {
				'@type': 'Person',
				'@id': SITE_OWNER.id,
				name: SITE_OWNER.name,
				description: ABOUT_DESCRIPTION,
				jobTitle: SITE_OWNER.jobTitle,
				worksFor: { '@type': 'Organization', ...SITE_OWNER.worksFor },
				alternateName: [
					SITE_OWNER.japaneseName,
					SITE_OWNER.formerName,
					SITE_OWNER.formerJapaneseName,
					SITE_OWNER.handle,
					SITE_OWNER.handleReading,
					SITE_OWNER.handleReadingKatakana,
				],
				url: SITE_OWNER.url,
				image: ufo.joinURL(SITE_ORIGIN, 'ryoppippi.avif'),
				sameAs: [...SITE_OWNER.sameAs],
			},
		},
	});
}
