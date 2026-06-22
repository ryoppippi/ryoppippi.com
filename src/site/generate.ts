import type { ContentArtifact, TweetRenderer } from '@ryoppippi/content';
import type { GeneratedFile } from './pages.ts';
import { blogDirectory, showcaseDirectory } from '@ryoppippi/content/paths';
import { access, cp, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'tinyglobby';
import {
	extractInstallSection,
	extractSection,
	fetchDotfilesReadme,
	parseStepCommands,
} from '../lib/dotfiles.ts';
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

async function copyContentAssets(outDir: string): Promise<void> {
	const blogDir = blogDirectory();
	const assets = await glob(['**/*', '!**/*.md'], { cwd: blogDir, onlyFiles: true });
	await Promise.all(
		assets.map(async (asset) => {
			const parts = asset.split('/');
			if (parts.length < 2) {
				return;
			}
			const destination = path.join(outDir, 'blog', parts[0], ...parts.slice(1));
			await mkdir(path.dirname(destination), { recursive: true });
			await cp(path.join(blogDir, asset), destination);
		}),
	);
}

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
	const { posts, showcase } = localContent;

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
	await copyContentAssets(outDir);
	await cp(showcaseDirectory(), path.join(outDir, 'works/showcase/assets'), {
		recursive: true,
		filter: (source) => !source.endsWith('.md') && !source.endsWith('index.ts'),
	});

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
