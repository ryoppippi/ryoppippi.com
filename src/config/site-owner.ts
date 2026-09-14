import { SITE_ORIGIN } from './site.ts';

type SiteOwnerIdentity = {
	id: string;
	name: string;
	japaneseName: string;
	japaneseDisplayName: string;
	formerName: string;
	formerJapaneseName: string;
	handle: string;
	handleReading: string;
	handleReadingKatakana: string;
	url: string;
	sameAs: readonly string[];
};

export const SITE_OWNER = {
	id: new URL('/#person', SITE_ORIGIN).href,
	name: 'Ryotaro Kimura',
	japaneseName: '木村亮太朗',
	japaneseDisplayName: '木村　亮太朗',
	formerName: 'Ryotaro Miura',
	formerJapaneseName: '三浦亮太朗',
	handle: '@ryoppippi',
	// The haichu logo carries the katakana reading only as pixels, so both Japanese forms live
	// here as text for screen readers, search engines, and LLM crawlers.
	handleReading: 'りょっぴっぴ',
	handleReadingKatakana: 'リョッピッピ',
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
