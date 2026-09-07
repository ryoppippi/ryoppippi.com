import type { PageCatalogue, PageContext } from './context.ts';
import type { OxContentCustomHostRenderResult } from '@ox-content/vite-plugin/custom-host';

/** One lazily rendered output, shared by development and prerendering. */
export type PageRoute = {
	path: string;
	render: (context: PageContext) => Promise<OxContentCustomHostRenderResult | undefined>;
};

/** A colocated page module enumerates its own static or content-derived outputs. */
export type PageRoutes = (catalogue: PageCatalogue) => PageRoute[];

const modules = import.meta.glob<{ routes: PageRoutes }>('/src/pages/**/index.ts', { eager: true });

/** Collects page endpoints without a separately maintained import or route list. */
export function createPageRoutes(catalogue: PageCatalogue) {
	return Object.values(modules).flatMap((module) => module.routes(catalogue));
}
