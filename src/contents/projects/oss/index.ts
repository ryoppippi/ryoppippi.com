import type { Entries } from 'type-fest';
import type { tags } from 'typia';
import typia from 'typia';
import { joinURL } from 'ufo';
import _ossProjects from './list.js';
import type { GHRepo, Project } from './types.js';
import { slugify } from '$lib/util.js';

const GITHUB_URL = `https://github.com`;

export type ProjectsByGenre = Readonly<Record<keyof typeof _ossProjects, (Required<Project> & GHRepo['repo'])[]>>;

export async function getProjects(fetch?: typeof globalThis.fetch): Promise<ProjectsByGenre> {
	const updatedProjects = await Promise.all(
		(Object.entries(_ossProjects) as Entries<typeof _ossProjects>)
			.map(async ([genre, projects]) => {
				const updatedGenreProjects = await Promise.all(
					projects.map(async (project) => {
						return Promise.resolve(project as Project)
							/* add slug */
							.then(originalProject => ({
								...originalProject,
								slug: slugify(originalProject.name),
							}))
							/* add link */
							.then(originalProject =>
								!typia.is<string>(originalProject?.link)
									? {
											...originalProject,
											link: joinURL(GITHUB_URL, 'ryoppippi', originalProject.name),
										}
									: originalProject,
							)
							/* fetch repo info from ungh.cc */
							.then(async (originalProject) => {
								if (!typia.is<string>(originalProject?.description)) {
									try {
										const unghURL = originalProject.link?.replace(GITHUB_URL, 'https://ungh.cc/repos').trim() ?? '';
										typia.assertGuard<string & tags.Format<'url'>>(unghURL);

										const ghRepoRes = await (fetch ?? globalThis.fetch)(unghURL);
										if (!ghRepoRes.ok) {
											throw new Error(`Failed to fetch ${unghURL}`);
										}

										const ghRepo = await ghRepoRes.json();
										typia.assertGuard<GHRepo>(ghRepo);

										return {
											...originalProject,
											...ghRepo.repo,
										};
									}
									catch (e) {
										console.error(e);
									}
								}
								return originalProject;
							});
					}),
				);

				/* return by tuple */
				return [genre, updatedGenreProjects] as const;
			}),
	);

	return Object.fromEntries(updatedProjects) as ProjectsByGenre;
}
