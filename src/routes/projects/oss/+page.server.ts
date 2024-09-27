import type { Entries } from 'type-fest';
import { joinURL } from 'ufo';
import type { tags } from 'typia';
import typia from 'typia';
import type { PageServerLoad } from './$types';
import type { GHRepo, Project, Projects } from './projects';
import _ossProjects from './projects';

const GITHUB_URL = `https://github.com`;

export type ReturnType = Readonly<Record<keyof typeof _ossProjects, (Required<Project> & GHRepo['repo'])[]>>;

export const load: PageServerLoad = async ({ fetch }) => {
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

						const ghRepoRes = await fetch(unghURL);
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

	const _writableProjects = writableOSSProjects as ReturnType;

	return {
		projects: _writableProjects,
	};
};
