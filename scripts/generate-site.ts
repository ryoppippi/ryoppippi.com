import type { GeneratedFile } from '../src/site/pages.ts';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'tinyglobby';
import { Route } from '../routes.ts';
import { extractInstallSection, extractSection, fetchDotfilesReadme, parseStepCommands } from '../src/lib/dotfiles.ts';
import { loadBlogPosts, loadExternalPosts } from '../src/site/content.ts';
import { corePages } from '../src/site/pages.ts';
import { errorPage, ossPage, publicationsPage, showcasePage, sponsorsPage, talksPage } from '../src/site/secondary-pages.ts';
import { loadOssProjects, loadPublications, loadShowcase, loadTalks } from '../src/site/sections.ts';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'build-static');

async function assetTags(): Promise<string> {
	const index = await readFile(path.join(outDir, 'index.html'), 'utf8');
	return [
		...index.matchAll(/<link[^>]*rel="stylesheet"[^>]*>/g),
		...index.matchAll(/<script[^>]*type="module"[^>]*><\/script>/g),
	].map(match => match[0]).join('\n\t');
}

async function copyContentAssets(): Promise<void> {
	const assets = await glob(['**/*', '!**/*.md'], { cwd: path.join(root, 'src/contents/blog'), onlyFiles: true });
	await Promise.all(assets.map(async (asset) => {
		const parts = asset.split('/');
		if (parts.length < 2) {
			return;
		}
		const destination = path.join(outDir, 'blog', parts[0], ...parts.slice(1));
		await mkdir(path.dirname(destination), { recursive: true });
		await cp(path.join(root, 'src/contents/blog', asset), destination);
	}));
}

const [posts, externalPosts, assets] = await Promise.all([
	loadBlogPosts(root),
	loadExternalPosts(root),
	assetTags(),
]);

const [ossProjects, showcase, publications, talks, dotfiles] = await Promise.all([
	loadOssProjects(root),
	loadShowcase(root),
	loadPublications(root),
	loadTalks(),
	fetchDotfilesReadme(fetch),
]);

const pages = [
	...corePages(posts, externalPosts, assets),
	ossPage(ossProjects, assets),
	showcasePage(showcase, assets),
	publicationsPage(publications, assets),
	talksPage(talks, assets),
	sponsorsPage(assets),
	errorPage(assets),
];

for (const file of pages) {
	const destination = path.join(outDir, file.path);
	await mkdir(path.dirname(destination), { recursive: true });
	await writeFile(destination, file.content);
}

await copyContentAssets();

await cp(path.join(root, 'src/contents/works/showcase'), path.join(outDir, 'works/showcase/assets'), {
	recursive: true,
	filter: source => !source.endsWith('.md') && !source.endsWith('index.ts'),
});

const install = extractSection(dotfiles, 'Initial Setup');
const osSections = [['mac', 'macOS'], ['linux', 'Linux']] as const;
const plainFiles: GeneratedFile[] = [
	{ path: 'dotfiles.md', content: dotfiles },
	{ path: 'dotfiles/install', content: install },
];
for (const [slug, heading] of osSections) {
	const section = extractInstallSection(dotfiles, heading);
	plainFiles.push({ path: `dotfiles/${slug}.html`, content: section });
	plainFiles.push(...parseStepCommands(section).map(({ step, command }) => ({ path: `dotfiles/${slug}/${step}`, content: command })));
}

const urls = pages.filter(file => file.path.endsWith('.html')).map(file => `https://ryoppippi.com/${file.path.replace(/(?:index)?\.html$/, '')}`);
plainFiles.push({ path: 'sitemap.xml', content: `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${url}</loc></url>`).join('')}</urlset>` });
plainFiles.push({ path: '_redirects', content: [...Route.map(({ from, to }) => `${from} ${to} 301`), '/works /works/oss 301'].join('\n') });

for (const file of plainFiles) {
	const destination = path.join(outDir, file.path);
	await mkdir(path.dirname(destination), { recursive: true });
	await writeFile(destination, file.content);
}
