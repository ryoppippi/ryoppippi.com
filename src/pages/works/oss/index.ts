import type { GeneratedFile } from '../../index.ts';
import type { SiteAssets } from '../../../site/assets.ts';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { page, renderComponent } from '../../../site/html.ts';
import Oss from '../../../site/templates/Oss.tsx';

export type OssProjectKind = 'project' | 'contribution';

export type OssProject = {
	name: string;
	link: string;
	slug: string;
	description: string | null;
	icon: string;
	kind: OssProjectKind;
	tags: string[];
	stars: number | null;
};

type OssProjectSource = Omit<OssProject, 'link' | 'slug' | 'description' | 'kind' | 'stars'> &
	Partial<Pick<OssProject, 'link' | 'slug' | 'description' | 'kind'>> & {
		useGitHubPrimaryLanguage?: boolean;
	};

type OssStarSnapshot = {
	updatedAt: string;
	projects: Array<{ repo: string; stars: number; primaryLanguage?: string | null }>;
};

function githubRepository(link: string): string | null {
	try {
		const url = new URL(link);
		if (url.hostname !== 'github.com' && url.hostname !== 'www.github.com') {
			return null;
		}
		const [owner, repository] = url.pathname.split('/').filter(Boolean);
		return owner == null || repository == null
			? null
			: owner + '/' + repository.replace(/\.git$/, '');
	} catch {
		return null;
	}
}

/** Loads the manually ordered open-source projects and their star snapshot. */
export async function loadOssProjects(root: string): Promise<OssProject[]> {
	const [source, starSnapshot] = await Promise.all([
		readFile(path.join(root, 'src/content/works/oss/list.json'), 'utf8'),
		readFile(path.join(root, 'src/content/works/oss/stars.json'), 'utf8'),
	]);
	const projects = JSON.parse(source) as OssProjectSource[];
	const stars = JSON.parse(starSnapshot) as OssStarSnapshot;
	const starCounts = new Map(stars.projects.map(({ repo, stars: count }) => [repo, count]));
	const primaryLanguages = new Map(
		stars.projects.map(({ repo, primaryLanguage }) => [repo, primaryLanguage ?? null]),
	);
	return Promise.all(
		projects.map(async (project) => {
			const { useGitHubPrimaryLanguage = false, ...projectData } = project;
			const link = project.link ?? 'https://github.com/ryoppippi/' + project.name;
			const repository = githubRepository(link);
			const primaryLanguage =
				repository == null ? null : (primaryLanguages.get(repository) ?? null);
			const tags =
				useGitHubPrimaryLanguage &&
				primaryLanguage != null &&
				!project.tags.includes(primaryLanguage)
					? [...project.tags, primaryLanguage]
					: project.tags;
			let description = project.description ?? null;
			if (description == null) {
				try {
					const response = await fetch('https://ungh.cc/repos/ryoppippi/' + project.name);
					if (response.ok) {
						const data = (await response.json()) as {
							repo?: { description?: string | null };
						};
						description = data.repo?.description ?? null;
					}
				} catch {
					description = null;
				}
			}
			return {
				...projectData,
				link,
				slug: project.slug ?? 'ryoppippi-' + project.name,
				description,
				kind: project.kind ?? 'project',
				tags,
				stars: repository == null ? null : (starCounts.get(repository) ?? null),
			} satisfies OssProject;
		}),
	);
}

/**
 * Renders the open-source projects page.
 *
 * @param projects - Manually ordered OSS projects to render.
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated open-source projects page.
 */
export function ossPage(projects: OssProject[], assets: SiteAssets): GeneratedFile {
	return {
		path: 'works/oss/index.html',
		sourcePaths: [
			'src/pages/works/oss/index.ts',
			'src/site/templates/Oss.tsx',
			'src/content/works/oss/list.json',
		],
		content: page({
			title: 'Open-source projects',
			pathname: '/works/oss/',
			content: renderComponent(Oss, { projects }),
			description:
				'Open-source projects by @ryoppippi across AI tools, Nix, TypeScript, Svelte, Vim, Zig, and shell configuration.',
			assets,
			style: 'works',
		}),
	};
}

if (import.meta.vitest != null) {
	test('uses the GitHub primary language for opted-in OSS projects', async () => {
		const { createFixture } = await import('fs-fixture');
		await using fixture = await createFixture({
			'src/content/works/oss/list.json': JSON.stringify([
				{
					name: 'ccusage',
					link: 'https://github.com/ccusage/ccusage',
					icon: 'icon',
					tags: ['AI', 'CLI'],
					useGitHubPrimaryLanguage: true,
					description: 'Token usage analyser',
				},
			]),
			'src/content/works/oss/stars.json': JSON.stringify({
				updatedAt: '2026-08-25T00:00:00Z',
				projects: [{ repo: 'ccusage/ccusage', stars: 1, primaryLanguage: 'Rust' }],
			}),
		});

		expect(await loadOssProjects(fixture.getPath('.'))).toMatchObject([
			{ tags: ['AI', 'CLI', 'Rust'], stars: 1 },
		]);
	});
}
