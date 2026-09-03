/** Page-specific stylesheet groups supported by the site. */
export const PAGE_STYLES = [
	'about',
	'article',
	'blog',
	'error',
	'home',
	'sponsors',
	'works',
] as const;

/** Name of a page-specific stylesheet group emitted by the site build. */
export type PageStyle = (typeof PAGE_STYLES)[number];
