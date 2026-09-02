import type { GeneratedFile } from '../index.ts';
import type { SiteAssets } from '../../site/assets.ts';
import * as ufo from 'ufo';
import { SITE_ORIGIN } from '../../site/consts.ts';
import { page, renderComponent } from '../../site/html.ts';
import { SITE_OWNER } from '../../site/site-owner.ts';
import About from '../../site/templates/About.tsx';

const PATHNAME = '/about/';
const TITLE = 'ryoppippi (Ryotaro Kimura)';
const DESCRIPTION =
	'Ryotaro Kimura (木村亮太朗), known as ryoppippi, builds developer tools, maintains ccusage and open-source projects, and is a Founding Engineer at Rork.';

/**
 * Renders the site owner's profile page.
 *
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated About page.
 */
export function aboutPage(assets: SiteAssets): GeneratedFile {
	const url = ufo.joinURL(SITE_ORIGIN, PATHNAME);
	return {
		path: 'about/index.html',
		sourcePaths: ['src/site/site-owner.ts', 'src/site/templates/About.tsx'],
		content: page({
			title: TITLE,
			pathname: PATHNAME,
			content: renderComponent(About, {}),
			description: DESCRIPTION,
			assets,
			style: 'about',
			structuredData: {
				'@context': 'https://schema.org',
				'@type': 'ProfilePage',
				'@id': ufo.withFragment(url, 'profile'),
				url,
				name: TITLE,
				description: DESCRIPTION,
				mainEntity: {
					'@type': 'Person',
					'@id': SITE_OWNER.id,
					name: SITE_OWNER.name,
					description: DESCRIPTION,
					jobTitle: 'Founding Engineer',
					worksFor: { '@type': 'Organization', name: 'Rork', url: 'https://rork.com/' },
					alternateName: [
						SITE_OWNER.japaneseName,
						SITE_OWNER.formerName,
						SITE_OWNER.formerJapaneseName,
						SITE_OWNER.handle,
					],
					url: SITE_OWNER.url,
					image: ufo.joinURL(SITE_ORIGIN, 'ryoppippi.avif'),
					sameAs: [...SITE_OWNER.sameAs],
				},
			},
		}),
	};
}
