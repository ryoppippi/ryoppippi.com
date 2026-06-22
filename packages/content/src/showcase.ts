import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { matter } from 'gray-matter-es';
import { glob } from 'tinyglobby';
import { renderMarkdown } from './markdown/render.ts';
import type { MarkdownRenderer } from './markdown-cache.ts';
import { showcaseDirectory } from './paths.ts';

export type ShowcaseProject = {
	title: string;
	link: string;
	image?: string;
	pubDate: string;
	featured: boolean;
	html: string;
};

export async function loadShowcase(
	renderContent: MarkdownRenderer = renderMarkdown,
): Promise<ShowcaseProject[]> {
	const directory = showcaseDirectory();
	const files = await glob('*.md', { cwd: directory, absolute: true });
	const projects = await Promise.all(
		files.map(async (filepath) => {
			const source = await readFile(filepath, 'utf8');
			const { data, content } = matter(source);
			const image =
				typeof data.image === 'string'
					? `/works/showcase/assets/${path.basename(data.image)}`
					: undefined;
			return {
				title: String(data.title),
				link: String(data.link),
				image,
				pubDate: new Date(String(data.date ?? data.pubDate)).toJSON(),
				featured: data.featured === true,
				html: await renderContent(content),
			} satisfies ShowcaseProject;
		}),
	);
	return projects.sort(
		(a, b) => Number(b.featured) - Number(a.featured) || b.pubDate.localeCompare(a.pubDate),
	);
}
