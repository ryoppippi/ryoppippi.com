import { siteOrigin } from './site-origin.ts';

export const author = {
	id: `${siteOrigin}/about/#person`,
	pageUrl: `${siteOrigin}/about/`,
	name: 'Ryotaro Kimura',
	japaneseName: '木村亮太朗',
	handle: '@ryoppippi',
	imageUrl: `${siteOrigin}/ryoppippi.jpg`,
	description:
		'Software engineer and open-source developer building ccusage, SiteMCP, and other developer tools.',
	sameAs: [
		'https://github.com/ryoppippi',
		'https://www.linkedin.com/in/ryoppippi/',
		'https://x.com/ryoppippi',
		'https://bsky.app/profile/ryoppippi.com',
		'https://cv.ryoppippi.com',
	],
} as const;

export const authorStructuredData = {
	'@type': 'Person',
	'@id': author.id,
	name: author.name,
	alternateName: [author.japaneseName, author.handle],
	url: author.pageUrl,
	image: author.imageUrl,
	description: author.description,
	sameAs: author.sameAs,
} as const;
