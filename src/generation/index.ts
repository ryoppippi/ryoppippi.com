import type { DocumentStylesheetInput } from '@ox-content/vite-plugin/document-assets';
import type {
	OxContentCustomHostAssetsContext,
	OxContentCustomHostRoutesContext,
} from '@ox-content/vite-plugin/custom-host';
import type { ContentArtifact } from '@/content/artifact.ts';
import type { PostListItem } from '@/content/external-content.ts';
import type { SiteAssets } from '@/rendering/site-assets.ts';
import type { OxContentCustomHostModule } from '@ox-content/vite-plugin/custom-host';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { withoutLeadingSlash } from 'ufo';
import { buildContentArtifact } from '@/content/build.ts';
import { createIslandRenderer } from '@/content/island-renderer.ts';
import { loadExternalMedia } from '@/content/external-content.ts';
import { inlineHomeStyles, resolveSiteAssets } from '@/rendering/site-assets.ts';
import { siteFeedCollections } from './feeds.ts';
import { generateStaticSite } from './generate-static-site.ts';

type HostContent = {
	content: ContentArtifact;
	externalMedia: PostListItem[];
};

type HostContentContext = Pick<OxContentCustomHostRoutesContext, 'loadModule' | 'memo' | 'root'>;

function linkedStylesheets(stylesheets: readonly DocumentStylesheetInput[]): string[] {
	return stylesheets.flatMap((stylesheet) => {
		if (typeof stylesheet === 'string') {
			return [stylesheet];
		}
		return stylesheet.href == null ? [] : [stylesheet.href];
	});
}

async function readBuiltSiteAssets(
	outDir: string,
	assetsContext: OxContentCustomHostAssetsContext,
	islandModules: readonly string[],
): Promise<SiteAssets> {
	const assets = resolveSiteAssets(assetsContext, islandModules);
	const baseFiles = linkedStylesheets(assets.sharedStyles);
	const homeFiles = linkedStylesheets(assets.pageStyles.home);
	if (baseFiles.length === 0 || homeFiles.length === 0) {
		throw new Error('Missing CSS assets for inline home styles');
	}
	const readCssFiles = (files: readonly string[]) =>
		Promise.all(
			files.map((file) => readFile(path.join(outDir, withoutLeadingSlash(file)), 'utf8')),
		).then((contents) => contents.join('\n'));
	const [base, home] = await Promise.all([
		readCssFiles([...new Set(baseFiles)]),
		readCssFiles(homeFiles),
	]);
	return inlineHomeStyles(assets, base, home);
}

function loadHostContent(context: HostContentContext): Promise<HostContent> {
	return context.memo('site-content', async () => {
		const [content, externalMedia] = await Promise.all([
			buildContentArtifact(createIslandRenderer((id) => context.loadModule(id))),
			loadExternalMedia(context.root),
		]);
		return { content, externalMedia };
	});
}

const host = {
	async routes(context) {
		const { outDir, root } = context;
		const { content, externalMedia } = await loadHostContent(context);
		const islandModules = [
			...new Set(
				content.posts
					.filter(({ isPublished }) => isPublished)
					.flatMap(({ clientModules }) => clientModules.map(({ moduleId }) => moduleId)),
			),
		];
		const files = await generateStaticSite({
			assets: await readBuiltSiteAssets(outDir, context.assets, islandModules),
			content,
			externalMedia,
			root,
		});
		return files.map((file) => {
			const sourcePaths = file.sourcePaths ?? [];
			return {
				path: `/${file.path.replace(/index\.html$/, '')}`,
				inputPath: sourcePaths[0],
				lastUpdatedPaths: sourcePaths.slice(1),
				unlisted: file.unlisted,
				render: () => ({
					body: file.content,
					outputPath: file.path,
					contentType: file.path.endsWith('.html') ? 'text/html' : 'text/plain',
				}),
			};
		});
	},
	async outputs(context) {
		const { content, externalMedia } = await loadHostContent(context);
		return { collections: siteFeedCollections(content.posts, externalMedia) };
	},
} satisfies OxContentCustomHostModule;

export default host;
