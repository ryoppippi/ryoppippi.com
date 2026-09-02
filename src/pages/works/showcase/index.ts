import type { ContentMarkdownRenderer } from '../../blog/markdown.ts';
import type { GeneratedFile } from '../../index.ts';
import type { SiteAssets } from '../../../site/assets.ts';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { matter } from 'gray-matter-es';
import { glob } from 'tinyglobby';
import { renderContentMarkdown } from '../../blog/markdown.ts';
import { page, renderComponent } from '../../../site/html.ts';
import Showcase from '../../../site/templates/Showcase.tsx';

export const showcaseDirectory = path.resolve(import.meta.dirname, '../../../content/showcase');

export type ShowcaseProject = {
	title: string;
	link: string;
	image?: string;
	pubDate: string;
	featured: boolean;
	html: string;
};

/** Loads and renders the project showcase entries. */
export async function loadShowcase(
	renderContent: ContentMarkdownRenderer = renderContentMarkdown,
): Promise<ShowcaseProject[]> {
	const files = await glob('*.md', { cwd: showcaseDirectory, absolute: true });
	const projects: ShowcaseProject[] = [];
	for (const filepath of files) {
		const source = await readFile(filepath, 'utf8');
		const { data, content } = matter(source);
		const image =
			typeof data.image === 'string'
				? `/works/showcase/assets/${path.basename(data.image)}`
				: undefined;
		projects.push({
			title: String(data.title),
			link: String(data.link),
			image,
			pubDate: new Date(String(data.date ?? data.pubDate)).toJSON(),
			featured: data.featured === true,
			html: await renderContent(content),
		});
	}
	return projects.sort(
		(a, b) => Number(b.featured) - Number(a.featured) || b.pubDate.localeCompare(a.pubDate),
	);
}

/**
 * Renders the project showcase page.
 *
 * @param projects - Showcase projects to render.
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated project showcase page.
 */
export function showcasePage(projects: ShowcaseProject[], assets: SiteAssets): GeneratedFile {
	return {
		path: 'works/showcase/index.html',
		sourcePaths: [
			'src/site/templates/Showcase.tsx',
			'src/pages/works/showcase/index.ts',
			'src/content/showcase',
		],
		content: page({
			title: 'Project showcase',
			pathname: '/works/showcase/',
			content: renderComponent(Showcase, { projects }),
			description:
				'Selected projects and experiments by @ryoppippi, with demos, source links, and implementation notes.',
			assets,
			style: 'works',
		}),
	};
}
