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

/** Server-rendered stylesheet modules included in each page style group. */
export const PAGE_STYLE_MODULES = {
	about: ['/src/pages/about/About.module.css'],
	article: [
		'/src/pages/blog/article/ArticleContent.css',
		'/src/pages/blog/article/Article.module.css',
	],
	blog: ['/src/pages/blog/BlogList.module.css'],
	error: ['/src/pages/error/Error.module.css'],
	home: ['/src/pages/home/Home.module.css'],
	sponsors: ['/src/pages/sponsors/Sponsors.module.css'],
	works: [
		'/src/pages/works/WorksProse.css',
		'/src/pages/works/_components/WorksNav/WorksNav.module.css',
		'/src/pages/works/_components/WorksSection/WorksSection.module.css',
		'/src/pages/works/media/Media.module.css',
		'/src/pages/works/oss/Oss.module.css',
		'/src/pages/works/publications/Publications.module.css',
		'/src/pages/works/showcase/Showcase.module.css',
		'/src/pages/works/talks/Talks.module.css',
	],
} as const satisfies Record<PageStyle, readonly string[]>;

/** CSS-only build entries rendered by the server rather than imported by client code. */
export const SERVER_STYLE_MODULES = [
	'/src/components/SiteLayout/SiteLayout.module.css',
	...Object.values(PAGE_STYLE_MODULES).flat(),
] as const satisfies readonly string[];
