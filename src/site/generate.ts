import type { BlogIslandSsrRenderer, BlogPost } from '../pages/blog/index.ts';
import type { ContentMarkdownRenderer } from '../pages/blog/markdown.ts';
import type { GeneratedFile } from '../pages/index.ts';
import type { ShowcaseProject } from '../pages/works/showcase/index.ts';
import type { SiteAssets } from './assets.ts';
import {
	articlePages,
	blogDirectory,
	blogListPage,
	loadBlogPosts,
	loadExternalPosts,
	postListItems,
} from '../pages/blog/index.ts';
import { renderContentMarkdown } from '../pages/blog/markdown.ts';
import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
	extractInstallSection,
	extractSection,
	fetchDotfilesReadme,
	parseStepCommands,
} from '../lib/dotfiles.ts';
import {
	contentAssetSources,
	emitDeduplicatedAssets,
	rewriteContentAssetUrls,
} from './content-assets.ts';
import { loadExternalMedia, mediaPage } from '../pages/works/media/index.ts';
import { loadOssProjects, ossPage } from '../pages/works/oss/index.ts';
import { loadPublications, publicationsPage } from '../pages/works/publications/index.ts';
import { loadShowcase, showcaseDirectory, showcasePage } from '../pages/works/showcase/index.ts';
import { loadTalks, talksPage } from '../pages/works/talks/index.ts';
import { writeOxContentOutputFiles } from './ox-content-output.ts';
import { errorPage } from '../pages/404.ts';
import { aboutPage } from '../pages/about/index.ts';
import { homePage } from '../pages/index.ts';
import { sponsorsPage } from '../pages/sponsors/index.ts';

export type PageContent = {
	posts: BlogPost[];
	showcase: ShowcaseProject[];
};

/** Builds the rendered content consumed by the static page generator. */
export async function buildPageContent(islandSsr?: BlogIslandSsrRenderer): Promise<PageContent> {
	const renderContent: ContentMarkdownRenderer = (content, options) =>
		renderContentMarkdown(content, { ...options, islandSsr });
	const [posts, showcase] = await Promise.all([
		loadBlogPosts(renderContent),
		loadShowcase(renderContent),
	]);
	return { posts, showcase };
}

type GenerateSiteOptions = {
	assets: SiteAssets;
	content?: PageContent;
	outDir: string;
	root: string;
};

async function writeGeneratedFiles(outDir: string, files: GeneratedFile[]): Promise<void> {
	for (const file of files) {
		const destination = path.join(outDir, file.path);
		await mkdir(path.dirname(destination), { recursive: true });
		await writeFile(destination, file.content);
	}
}

/**
 * Generates the static site and its auxiliary files.
 *
 * @param assets - Bundled site assets referenced by generated pages.
 * @param content - Optional prebuilt content.
 * @param outDir - Directory that receives generated files.
 * @param root - Repository root used for source loading and Git metadata.
 * @returns A promise that resolves after all generated files are written.
 */
export async function generateSite({
	assets,
	content,
	outDir,
	root,
}: GenerateSiteOptions): Promise<void> {
	let localContent = content;
	if (localContent == null) {
		localContent = await buildPageContent();
	}
	const [externalPosts, externalMedia, ossProjects, publications, talks, dotfiles] =
		await Promise.all([
			loadExternalPosts(root),
			loadExternalMedia(root),
			loadOssProjects(root),
			loadPublications(root),
			loadTalks(),
			fetchDotfilesReadme(fetch),
		]);
	const emittedAssets = await emitDeduplicatedAssets(
		await contentAssetSources(blogDirectory, showcaseDirectory),
		outDir,
	);
	const posts = localContent.posts.map((post) => ({
		...post,
		html: rewriteContentAssetUrls(post.html, `/blog/${post.filename}/`, emittedAssets.urls),
	}));
	const showcase = localContent.showcase.map((project) => ({
		...project,
		image:
			project.image == null
				? undefined
				: (emittedAssets.urls.get(new URL(project.image, 'https://content.invalid').pathname) ??
					project.image),
	}));

	const pages = [
		homePage(assets),
		blogListPage([...externalPosts, ...postListItems(posts)], assets),
		...posts.filter((post) => post.isPublished).flatMap((post) => articlePages(post, assets)),
		aboutPage(assets),
		ossPage(ossProjects, assets),
		showcasePage(showcase, assets),
		publicationsPage(publications, assets),
		talksPage(talks, assets),
		mediaPage(externalMedia, assets),
		sponsorsPage(assets),
		errorPage(assets),
	];

	await writeGeneratedFiles(outDir, pages);
	await writeOxContentOutputFiles({ media: externalMedia, outDir, pages, root });

	const install = extractSection(dotfiles, 'Setup');
	const osSections = [
		['mac', 'macOS'],
		['linux', 'Linux'],
	] as const;
	const plainFiles: GeneratedFile[] = [
		{ path: 'dotfiles.md', content: dotfiles },
		{ path: 'dotfiles/install', content: install },
	];

	for (const [slug, heading] of osSections) {
		const section = extractInstallSection(dotfiles, heading);
		plainFiles.push({ path: `dotfiles/${slug}.html`, content: section });
		plainFiles.push(
			...parseStepCommands(section).map(({ step, command }) => ({
				path: `dotfiles/${slug}/${step}`,
				content: command,
			})),
		);
	}

	await writeGeneratedFiles(outDir, plainFiles);

	await Promise.all(
		[
			'index.html',
			'about/index.html',
			'works/oss/index.html',
			'works/showcase/index.html',
			'works/talks/index.html',
			'works/media/index.html',
			'works/media/feed.xml',
			'works/publications/index.html',
		].map((file) => access(path.join(outDir, file))),
	);
}
