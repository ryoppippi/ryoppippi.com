import { PAGE_STYLES, type PageStyle } from './assets.ts';

type PageStyleLoader = () => Promise<unknown>;
type PageStyleLoaders = Record<PageStyle, PageStyleLoader>;

const pageStyleLoaders = {
	article: () => import('./styles/article.css'),
	blog: () => import('./styles/blog.css'),
	error: () => import('./styles/error.css'),
	home: () => import('./styles/home.css'),
	sponsors: () => import('./styles/sponsors.css'),
	works: () => import('./styles/works.css'),
} satisfies PageStyleLoaders;

export function missingPageStyles(current: readonly string[], next: readonly string[]): string[] {
	const loaded = new Set(current);
	return next.filter((href) => !loaded.has(href));
}

export function obsoletePageStyles(current: readonly string[], next: readonly string[]): string[] {
	const required = new Set(next);
	return current.filter((href) => !required.has(href));
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
	describe(missingPageStyles, () => {
		it('returns only stylesheets not already loaded by the document', () => {
			expect(
				missingPageStyles(
					['/assets/base.css', '/assets/article.css'],
					['/assets/base.css', '/assets/article.css', '/assets/Tweet.css'],
				),
			).toEqual(['/assets/Tweet.css']);
		});
	});

	describe(obsoletePageStyles, () => {
		it('returns stylesheets that the next document does not use', () => {
			expect(
				obsoletePageStyles(
					['/assets/base.css', '/assets/home.css', '/assets/blog.css'],
					['/assets/base.css', '/assets/blog.css'],
				),
			).toEqual(['/assets/home.css']);
		});
	});

	describe(loadPageStyle, () => {
		it('loads the stylesheet for a recognised page style', async () => {
			const article = vi.fn(async () => undefined);
			const other = vi.fn(async () => undefined);
			const loaders = {
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
