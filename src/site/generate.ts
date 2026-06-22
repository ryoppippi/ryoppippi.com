import type { ContentArtifact, TweetRenderer } from '@ryoppippi/content';
import type { GeneratedFile } from './pages.ts';
import { blogDirectory, showcaseDirectory } from '@ryoppippi/content/paths';
import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
	extractInstallSection,
	extractSection,
	fetchDotfilesReadme,
	parseStepCommands,
} from '../lib/dotfiles.ts';
import {
	appendAssetRedirects,
	contentAssetSources,
	emitDeduplicatedAssets,
	rewriteContentAssetUrls,
} from './content-assets.ts';
import { loadExternalPosts } from './content.ts';
import { corePages } from './pages.ts';
import {
	errorPage,
	ossPage,
	publicationsPage,
	showcasePage,
	sponsorsPage,
	talksPage,
} from './secondary-pages.ts';
import { loadOssProjects, loadPublications, loadTalks } from './sections.ts';

type GenerateSiteOptions = {
	assets: string;
	content?: ContentArtifact;
	outDir: string;
	renderTweet?: TweetRenderer;
	root: string;
};

async function writeGeneratedFiles(outDir: string, files: GeneratedFile[]): Promise<void> {
	for (const file of files) {
		const destination = path.join(outDir, file.path);
		await mkdir(path.dirname(destination), { recursive: true });
		await writeFile(destination, file.content);
	}
}

export async function generateSite({
	assets,
	content,
	outDir,
	renderTweet,
	root,
}: GenerateSiteOptions): Promise<void> {
	let localContent = content;
	if (localContent == null) {
		if (renderTweet == null) {
			throw new Error('renderTweet is required when no content artifact is provided');
		}
		const { buildContentArtifact } = await import('@ryoppippi/content/build');
		localContent = await buildContentArtifact(renderTweet);
	}
	const [externalPosts, ossProjects, publications, talks, dotfiles] = await Promise.all([
		loadExternalPosts(root),
		loadOssProjects(root),
		loadPublications(root),
		loadTalks(),
		fetchDotfilesReadme(fetch),
	]);
	const emittedAssets = await emitDeduplicatedAssets(
		await contentAssetSources(blogDirectory(), showcaseDirectory()),
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
		...corePages(posts, externalPosts, assets),
		ossPage(ossProjects, assets),
		showcasePage(showcase, assets),
		publicationsPage(publications, assets),
		talksPage(talks, assets),
		sponsorsPage(assets),
		errorPage(assets),
	];

	await writeGeneratedFiles(outDir, pages);
	await appendAssetRedirects(path.join(outDir, '_redirects'), emittedAssets.redirects);

	const install = extractSection(dotfiles, 'Initial Setup');
	const osSections = [
		['mac', 'macOS'],
		['linux', 'Linux'],
	] as const;
	const plainFiles: GeneratedFile[] = [
		{
			path: 'works/index.html',
			content:
				'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/works/oss/"><link rel="canonical" href="https://ryoppippi.com/works/oss/"><title>Redirecting to works</title></head><body><a href="/works/oss/">Continue to works</a></body></html>',
		},
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

	const urls = pages
		.filter((file) => file.path.endsWith('.html') && file.path !== '404.html')
		.map((file) => `https://ryoppippi.com/${file.path.replace(/(?:index)?\.html$/, '')}`);
	plainFiles.push({
		path: 'sitemap.xml',
		content: `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${url}</loc></url>`).join('')}</urlset>`,
	});
	await writeGeneratedFiles(outDir, plainFiles);

	await Promise.all(
		[
			'index.html',
			'works/index.html',
			'works/oss/index.html',
			'works/showcase/index.html',
			'works/talks/index.html',
			'works/publications/index.html',
		].map((file) => access(path.join(outDir, file))),
	);
}
