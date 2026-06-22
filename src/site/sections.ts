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
};

type OssProjectSource = Omit<OssProject, 'link' | 'slug' | 'description'> &
	Partial<Pick<OssProject, 'link' | 'slug' | 'description'>>;

export async function loadOssProjects(root: string): Promise<Record<string, OssProject[]>> {
	const source = JSON.parse(
		await readFile(path.join(root, 'src/contents/works/oss/list.json'), 'utf8'),
	) as Record<string, OssProjectSource[]>;
	const entries = await Promise.all(
		Object.entries(source).map(
			async ([genre, projects]) =>
				[
					genre,
					await Promise.all(
						projects.map(async (project) => {
							const link = project.link ?? `https://github.com/ryoppippi/${project.name}`;
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
