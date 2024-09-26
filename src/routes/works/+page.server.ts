import type { Entries } from 'type-fest';
import { joinURL } from 'ufo';
import type { tags } from 'typia';
import typia from 'typia';
import { isEqual } from 'ohash';
import type { PageServerLoad } from './$types';
import type { GHRepo, Project, Projects } from './projects';
import _projects from './projects';
import { Json, getCachePath } from '$lib/cache';

const GITHUB_URL = `https://github.com`;

type ReturnType = Readonly<Record<keyof typeof _projects, (Required<Project> & GHRepo['repo'])[]>>;

export const load: PageServerLoad = async ({ fetch }) => {
	const cachePath = getCachePath('projects', _projects);
	using cacheJson = new Json<ReturnType>(cachePath, { allowNoExist: true });

	/* if null or empty */
	if (!typia.is<EmptyObject | null | undefined>(cacheJson.data)) {
		return {
			projects: cacheJson.data,
		};
	}

	const writableProjects: Projects = _projects;
	const fetchPromises: Promise<void>[] = [];

	for (const [gerne, projects] of Object.entries(writableProjects) as Entries<typeof _projects>) {
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
					writableProjects[gerne][index] = originalProject;
				})();
				fetchPromises.push(fetchPromise);
			}
			else {
				writableProjects[gerne][index] = originalProject;
			}
		}
	}

	await Promise.all(fetchPromises);

	const _writableProjects = writableProjects as ReturnType;

	if (!isEqual(cacheJson.data, _writableProjects)) {
		cacheJson.data = _writableProjects;
	}

	return {
		projects: _writableProjects,
	};
};
