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

export type OssProject = {
	name: string;
	link: string;
	slug: string;
	description: string | null;
	icon: string;
	stars: number | null;
};

type OssProjectSource = Omit<OssProject, 'link' | 'slug' | 'description' | 'stars'> &
	Partial<Pick<OssProject, 'link' | 'slug' | 'description'>>;

type OssStarSnapshot = {
	updatedAt: string;
	projects: Array<{ repo: string; stars: number }>;
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

export async function loadOssProjects(root: string): Promise<Record<string, OssProject[]>> {
	const [source, starSnapshot] = await Promise.all([
		readFile(path.join(root, 'src/contents/works/oss/list.json'), 'utf8'),
		readFile(path.join(root, 'src/contents/works/oss/stars.json'), 'utf8'),
	]);
	const projects = JSON.parse(source) as Record<string, OssProjectSource[]>;
	const stars = JSON.parse(starSnapshot) as OssStarSnapshot;
	const starCounts = new Map(stars.projects.map(({ repo, stars: count }) => [repo, count]));
	const entries = await Promise.all(
		Object.entries(projects).map(
			async ([genre, projects]) =>
				[
					genre,
					await Promise.all(
						projects.map(async (project) => {
							const link = project.link ?? `https://github.com/ryoppippi/${project.name}`;
							const repository = githubRepository(link);
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
								...project,
								link,
								slug: project.slug ?? `ryoppippi-${project.name}`,
								description,
								stars: repository == null ? null : (starCounts.get(repository) ?? null),
							} satisfies OssProject;
						}),
					),
				] as const,
		),
	);
	return Object.fromEntries(entries);
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
