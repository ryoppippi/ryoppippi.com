import { SITE_ORIGIN } from './consts.ts';

type SiteOwnerIdentity = {
	id: string;
	name: string;
	japaneseName: string;
	formerName: string;
	formerJapaneseName: string;
	handle: string;
	url: string;
	sameAs: readonly string[];
};

export const SITE_OWNER = {
	id: new URL('/#person', SITE_ORIGIN).href,
	name: 'Ryotaro Kimura',
	japaneseName: '木村亮太朗',
	formerName: 'Ryotaro Miura',
	formerJapaneseName: '三浦亮太朗',
	handle: '@ryoppippi',
	url: new URL('/', SITE_ORIGIN).href,
	sameAs: [
		'https://github.com/ryoppippi',
		'https://www.linkedin.com/in/ryoppippi/',
		'https://x.com/ryoppippi',
		'https://bsky.app/profile/ryoppippi.com',
		'https://www.youtube.com/channel/UCJbUM-yZx6mESJw82-OpMuQ',
		'https://cv.ryoppippi.com/',
	],
} as const satisfies SiteOwnerIdentity;
