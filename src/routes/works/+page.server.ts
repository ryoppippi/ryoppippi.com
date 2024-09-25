import type { Entries } from 'type-fest';
import fs from 'fs-extra';
import { joinURL } from 'ufo';
import typia from 'typia';
import type { PageServerLoad } from './$types';
import type { GHRepo, Project, Projects } from './projects';
import _projects from './projects';
import { Json, getCachePath } from '$lib/cache';

const GITHUB_URL = `https://github.com`;

type ReturnType = Readonly<Record<keyof typeof _projects, (Required<Project> & GHRepo['repo'])[]>>;

export const load: PageServerLoad = async ({ fetch }) => {
	const cachePath = getCachePath('projects', _projects);
	using cacheJson = new Json<ReturnType>(cachePath, { allowNoExist: true });
	if (cacheJson.data != null) {
		return {
			projects: cacheJson.data,
		};
	}

	const writableProjects: Projects = _projects;
	for (const [gerne, projects] of Object.entries(writableProjects) as Entries<typeof _projects>) {
		for (const [index, project] of projects.entries()) {
			let originalProject = structuredClone(project as Project);
			if (!Object.hasOwn(project, 'link')) {
				originalProject = {
					...originalProject,
					link: joinURL(GITHUB_URL, 'ryoppippi', project.name),
				};
			}
			if (!Object.hasOwn(project, 'desc')
				&& 'link' in project && project.link.startsWith(GITHUB_URL)) {
				try {
					const unghURL = project.link.replace(GITHUB_URL, 'https://ungh.cc/repos');
					const ghRepo = await fetch(unghURL);
					if (!ghRepo.ok) {
						throw new Error(`Failed to fetch ${unghURL}`);
					}
					const t = await ghRepo.json();
					const r = typia.assert<GHRepo>(t);
					originalProject = {
						...originalProject,
						...r.repo,
					};
				}
				catch (e) {
					console.error(e);
				}
			}
			writableProjects[gerne][index] = originalProject;
		};
	}

	const _writableProjects = writableProjects as ReturnType;

	cacheJson.data = _writableProjects;

	return {
		projects: _writableProjects,
	};
};
