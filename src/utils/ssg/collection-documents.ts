import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
	buildCollectionManifest,
	createFrameworkMarkdownOptions,
	normalizeMarkdownExtensions,
	resolveCascadeOptions,
	resolveCollectionsOptions,
	resolvePermalinksOptions,
	type OxContentOptions,
} from '@ox-content/vite-plugin';

/** Collection source and metadata needed for publication and asset selection. */
export type SiteCollectionDocument = {
	collection: string;
	documentPath: string;
	frontmatter: Record<string, unknown>;
	source: string;
};

/** Build context used by the site's explicit publication policy. */
export type SiteCollectionContext = { root: string; command: 'build' | 'serve'; mode: string };

/** Selects source documents without rendering their embeds or publishing extra files. */
export type SiteCollectionOptions = {
	oxContent?: OxContentOptions;
	collections: readonly string[];
	select: (document: SiteCollectionDocument, context: SiteCollectionContext) => boolean;
};

/**
 * Reads selected documents from the framework-neutral collection manifest.
 * @param input - Collections and publication policy.
 * @param context - Project root and build mode.
 * @returns Authored source and resolved frontmatter for selected documents.
 */
export async function resolveSiteCollectionDocuments(
	input: SiteCollectionOptions,
	context: SiteCollectionContext,
): Promise<SiteCollectionDocument[]> {
	const options = input.oxContent ?? {};
	const srcDir = options.srcDir ?? 'content';
	const collections = resolveCollectionsOptions(options.collections);
	const manifest = await buildCollectionManifest(context.root, {
		...createFrameworkMarkdownOptions({
			srcDir,
			outDir: 'dist',
			base: '/',
			extensions: normalizeMarkdownExtensions(options.extensions),
			gfm: true,
			frontmatter: true,
			toc: false,
			tocMaxDepth: 3,
		}),
		collections: {
			...collections,
			collections: Object.fromEntries(
				Object.entries(collections.collections).map(([name, collection]) => [
					name,
					{ ...collection, include: [] },
				]),
			),
		},
		cascade: resolveCascadeOptions(options.cascade),
		permalinks: resolvePermalinksOptions(options.permalinks),
	});
	const documents: SiteCollectionDocument[] = [];
	for (const collection of input.collections) {
		for (const entry of manifest.collections[collection] ?? []) {
			const documentPath = path.resolve(context.root, srcDir, entry.source);
			const document = {
				collection,
				documentPath,
				frontmatter: entry.frontmatter,
				source: await readFile(documentPath, 'utf8'),
			};
			if (input.select(document, context)) documents.push(document);
		}
	}
	return documents;
}
