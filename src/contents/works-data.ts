import { readFile } from 'node:fs/promises';
import path from 'node:path';

export type Talk = {
	title: string;
	date: string;
	lang?: string;
	event: string;
	eventLink?: string;
	videoLink?: string;
	links: string[];
};

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
			: `${owner}/${repository.replace(/\.git$/, '')}`;
	} catch {
		return null;
	}
}

export async function loadOssProjects(root: string): Promise<OssProject[]> {
	const [source, starSnapshot] = await Promise.all([
		readFile(path.join(root, 'src/contents/works/oss/list.json'), 'utf8'),
		readFile(path.join(root, 'src/contents/works/oss/stars.json'), 'utf8'),
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
			const link = project.link ?? `https://github.com/ryoppippi/${project.name}`;
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
					const response = await fetch(`https://ungh.cc/repos/ryoppippi/${project.name}`);
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
				slug: project.slug ?? `ryoppippi-${project.name}`,
				description,
				kind: project.kind ?? 'project',
				tags,
				stars: repository == null ? null : (starCounts.get(repository) ?? null),
			} satisfies OssProject;
		}),
	);
}

export async function loadTalks(): Promise<Talk[]> {
	const response = await fetch('https://talks.ryoppippi.com/talks.json');
	if (!response.ok) {
		throw new Error(`Failed to fetch talks: ${response.status} ${response.statusText}`);
	}
	return (await response.json()) as Talk[];
}

export async function loadPublications(
	root: string,
): Promise<
	Record<string, Array<{ title: string; link: string; authors: string; publisher: string }>>
> {
	return JSON.parse(
		await readFile(path.join(root, 'src/contents/publication.json'), 'utf8'),
	) as Record<string, Array<{ title: string; link: string; authors: string; publisher: string }>>;
}

if (import.meta.vitest != null) {
	test('uses the GitHub primary language for opted-in OSS projects', async () => {
		const { createFixture } = await import('fs-fixture');
		await using fixture = await createFixture({
			'src/contents/works/oss/list.json': JSON.stringify([
				{
					name: 'ccusage',
					link: 'https://github.com/ccusage/ccusage',
					icon: 'icon',
					tags: ['AI', 'CLI'],
					useGitHubPrimaryLanguage: true,
					description: 'Token usage analyser',
				},
			]),
			'src/contents/works/oss/stars.json': JSON.stringify({
				updatedAt: '2026-08-25T00:00:00Z',
				projects: [{ repo: 'ccusage/ccusage', stars: 1, primaryLanguage: 'Rust' }],
			}),
		});

		expect(await loadOssProjects(fixture.getPath('.'))).toMatchObject([
			{ tags: ['AI', 'CLI', 'Rust'], stars: 1 },
		]);
	});
}
