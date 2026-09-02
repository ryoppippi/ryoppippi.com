import type { SiteAssets } from '../../assets.ts';
import type { GeneratedFile } from '../../generated-file.ts';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import * as ufo from 'ufo';
import { renderMarkdown } from '../../../content/markdown/render.ts';
import { SITE_ORIGIN } from '../../consts.ts';
import { page, renderComponent } from '../../html.ts';
import { SITE_OWNER } from '../../site-owner.ts';
import Profile from './Profile.tsx';

const ABOUT_PATHNAME = '/about/';
const ABOUT_TITLE = 'ryoppippi (Ryotaro Kimura)';
const ABOUT_DESCRIPTION =
	'Ryotaro Kimura (木村亮太朗), known as ryoppippi, builds developer tools, maintains ccusage and open-source projects, and is a Founding Engineer at Rork.';

/**
 * Renders the site owner's profile page.
 *
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated About page.
 */
export async function aboutPage(assets: SiteAssets): Promise<GeneratedFile> {
	const url = ufo.joinURL(SITE_ORIGIN, ABOUT_PATHNAME);
	const source = await readFile(path.join(import.meta.dirname, 'index.mdx'), 'utf8');
	const content = await renderMarkdown(source, { mdx: true });
	return {
		path: 'about/index.html',
		sourcePaths: ['src/site/site-owner.ts', 'src/site/pages/about'],
		content: page({
			title: ABOUT_TITLE,
			pathname: ABOUT_PATHNAME,
			content: renderComponent(Profile, { content }),
			description: ABOUT_DESCRIPTION,
			assets,
			style: 'about',
			structuredData: {
				'@context': 'https://schema.org',
				'@type': 'ProfilePage',
				'@id': ufo.withFragment(url, 'profile'),
				url,
				name: ABOUT_TITLE,
				description: ABOUT_DESCRIPTION,
				mainEntity: {
					'@type': 'Person',
					'@id': SITE_OWNER.id,
					name: SITE_OWNER.name,
					description: ABOUT_DESCRIPTION,
					jobTitle: 'Founding Engineer',
					worksFor: {
						'@type': 'Organization',
						name: 'Rork',
						url: 'https://rork.com/',
					},
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
