import type { GeneratedFile } from '@/utils/ssg/output.ts';
import type { PageCatalogue, PageContext } from './context.ts';
import type { OxContentCustomHostRenderResult } from '@ox-content/vite-plugin/custom-host';

/** One lazily rendered output, shared by development and prerendering. */
export type PageRoute = {
	path: string;
	render: (context: PageContext) => Promise<GeneratedFile | null>;
};

/** A colocated page module enumerates its own static or content-derived outputs. */
export type PageRoutes = (catalogue: PageCatalogue) => PageRoute[];

const modules = import.meta.glob<{ routes: PageRoutes }>('/src/pages/**/index.ts', { eager: true });

/** Collects page endpoints without a separately maintained import or route list. */
export function createPageRoutes(catalogue: PageCatalogue) {
	return Object.values(modules)
		.flatMap((module) => module.routes(catalogue))
		.map((route) => ({
			path: route.path,
			async render(context: PageContext) {
				const file = await route.render(context);
				if (file == null) return undefined;
				const [inputPath, ...lastUpdatedPaths] = file.sourcePaths ?? [];
				return {
					body: file.content,
					outputPath: file.path,
					inputPath,
					lastUpdatedPaths,
					unlisted: file.unlisted,
					contentType:
						file.contentType ??
						(file.path.endsWith('.html')
							? 'text/html; charset=utf-8'
							: file.path.endsWith('.md')
								? 'text/markdown; charset=utf-8'
								: 'text/plain; charset=utf-8'),
				} satisfies OxContentCustomHostRenderResult;
			},
		}));
}
