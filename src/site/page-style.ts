export const PAGE_STYLES = [
	'about',
	'article',
	'blog',
	'error',
	'home',
	'sponsors',
	'works',
] as const;

/** Page-specific stylesheet groups emitted by the site build. */
export type PageStyle = (typeof PAGE_STYLES)[number];
