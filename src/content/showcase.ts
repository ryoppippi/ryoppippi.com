import path from 'node:path';
import type { CollectionEntry } from '@ox-content/vite-plugin';
import { renderMarkdown, type MarkdownRenderer } from './markdown/render.ts';

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
	entries?: readonly CollectionEntry[],
): Promise<ShowcaseProject[]> {
	const collection =
		entries ??
		(await (await import('virtual:ox-content/collections')).queryCollection('showcase').all());
	const projects = await Promise.all(
		collection.map(async (entry) => {
			if (entry.body == null) {
				throw new Error(`Showcase collection must include body: ${entry.source}`);
			}
			const data = entry.frontmatter;
			const image =
				typeof data.image === 'string'
					? `/works/showcase/assets/${path.basename(data.image)}`
					: undefined;
			const rendered = await renderContent(entry.body);
			return {
				title: String(data.title),
				link: String(data.link),
				image,
				pubDate: new Date(String(data.date ?? data.pubDate)).toJSON(),
				featured: data.featured === true,
				html: rendered.html,
			} satisfies ShowcaseProject;
		}),
	);
	return projects.sort(
		(a, b) => Number(b.featured) - Number(a.featured) || b.pubDate.localeCompare(a.pubDate),
	);
}
