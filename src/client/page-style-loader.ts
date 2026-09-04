import { PAGE_STYLES, type PageStyle } from './page-style-registry.ts';

type PageStyleLoader = () => Promise<unknown>;
type PageStyleLoaders = Record<PageStyle, PageStyleLoader>;

const pageStyleLoaders = {
	about: () => import('@/pages/about/About.module.css'),
	article: () =>
		Promise.all([
			import('@/pages/blog/article/ArticleContent.css'),
			import('@/pages/blog/article/Article.module.css'),
		]),
	blog: () => import('@/pages/blog/BlogList.module.css'),
	error: () => import('@/pages/error/Error.module.css'),
	home: () => import('@/pages/home/Home.module.css'),
	sponsors: () => import('@/pages/sponsors/Sponsors.module.css'),
	works: () =>
		Promise.all([
			import('@/pages/works/WorksProse.css'),
			import('@/pages/works/_components/WorksNav/WorksNav.module.css'),
			import('@/pages/works/_components/WorksSection/WorksSection.module.css'),
			import('@/pages/works/media/Media.module.css'),
			import('@/pages/works/oss/Oss.module.css'),
			import('@/pages/works/publications/Publications.module.css'),
			import('@/pages/works/showcase/Showcase.module.css'),
			import('@/pages/works/talks/Talks.module.css'),
		]),
} satisfies PageStyleLoaders;

export function needsInitialPageStyle(
	style: string | undefined,
	inlineStyle: string | undefined,
): boolean {
	return style != null && style !== inlineStyle;
}

function isPageStyle(value: string): value is PageStyle {
	return PAGE_STYLES.some((candidate) => candidate === value);
}

export async function loadPageStyle(
	style: string | undefined,
	loaders: PageStyleLoaders = pageStyleLoaders,
): Promise<void> {
	if (style == null || !isPageStyle(style)) {
		return;
	}
	await loaders[style]();
}

if (import.meta.vitest != null) {
	describe(needsInitialPageStyle, () => {
		it('skips a page style already inlined by the static document', () => {
			expect(needsInitialPageStyle('home', 'home')).toBe(false);
			expect(needsInitialPageStyle('blog', undefined)).toBe(true);
		});
	});

	describe(loadPageStyle, () => {
		it('loads the stylesheet for a recognised page style', async () => {
			const article = vi.fn(async () => undefined);
			const other = vi.fn(async () => undefined);
			const loaders = {
				about: other,
				article,
				blog: other,
				error: other,
				home: other,
				sponsors: other,
				works: other,
			} satisfies PageStyleLoaders;

			await loadPageStyle('article', loaders);

			expect(article).toHaveBeenCalledOnce();
			expect(other).not.toHaveBeenCalled();
		});

		it('ignores an unknown page style', async () => {
			const loader = vi.fn(async () => undefined);
			const loaders = {
				about: loader,
				article: loader,
				blog: loader,
				error: loader,
				home: loader,
				sponsors: loader,
				works: loader,
			} satisfies PageStyleLoaders;

			await loadPageStyle('unknown', loaders);

			expect(loader).not.toHaveBeenCalled();
		});
	});
}
