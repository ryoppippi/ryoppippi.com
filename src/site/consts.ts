const DEFAULT_SITE_ORIGIN = 'https://ryoppippi.com';

/**
 * Canonical origin used when generating absolute site URLs.
 */
export const SITE_ORIGIN = import.meta.env.PUBLIC_ORIGIN ?? DEFAULT_SITE_ORIGIN;

/**
 * Site identity values shared by generated pages and templates.
 */
export const SITE_NAME = 'ryoppippi.com';

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

/**
 * JPEG URL used by social cards and feed metadata for broad consumer compatibility.
 */
export const SITE_SOCIAL_IMAGE_URL = `${SITE_ORIGIN}/ryoppippi.jpg`;

/** The licence, period, and holder applied to original blog content. */
export const SITE_COPYRIGHT = 'CC BY-NC-SA 4.0 2022-PRESENT © ryoppippi';
