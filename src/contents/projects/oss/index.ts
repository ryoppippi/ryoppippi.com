import type { Entries } from 'type-fest';
import type { tags } from 'typia';
import typia from 'typia';
import { joinURL } from 'ufo';
import _ossProjects from './list.js';
import type { GHRepo, Project, Projects } from './types.js';

const GITHUB_URL = `https://github.com`;

export type ReturnType = Readonly<Record<keyof typeof _ossProjects, (Required<Project> & GHRepo['repo'])[]>>;

export async function getProjects(fetch?: typeof globalThis.fetch): Promise<ReturnType> {
	const writableOSSProjects: Projects = _ossProjects;
	const fetchPromises: Promise<void>[] = [];

	for (const [gerne, projects] of Object.entries(writableOSSProjects) as Entries<typeof _ossProjects>) {
		for (const [index, project] of projects.entries()) {
			let originalProject = structuredClone(project as Project);
			if (!typia.is<string>(originalProject?.link)) {
				originalProject = {
					...originalProject,
					link: joinURL(GITHUB_URL, 'ryoppippi', project.name),
				};
			}
			if (!typia.is<string>(originalProject?.description)) {
				const fetchPromise = (async () => {
					try {
						const unghURL = originalProject.link?.replace(GITHUB_URL, 'https://ungh.cc/repos').trim() ?? '';
						typia.assertGuard<string & tags.Format<'url'>>(unghURL);

						const ghRepoRes = await (fetch ?? globalThis.fetch)(unghURL);
						if (!ghRepoRes.ok) {
							throw new Error(`Failed to fetch ${unghURL}`);
						}
						const ghRepo = await ghRepoRes.json();
						typia.assertGuard<GHRepo>(ghRepo);
						originalProject = {
							...originalProject,
							...ghRepo.repo,
						};
					}
					catch (e) {
						console.error(e);
					}
					writableOSSProjects[gerne][index] = originalProject;
				})();
				fetchPromises.push(fetchPromise);
			}
			else {
				writableOSSProjects[gerne][index] = originalProject;
			}
		}
	}

	await Promise.all(fetchPromises);

	return writableOSSProjects as ReturnType;
}
