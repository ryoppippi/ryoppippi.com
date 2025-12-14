import type { Entries } from 'type-fest';
import type { Project } from './types.js';
import * as ufo from 'ufo';
import _ossProjects from './list.json';
import { OssProjects, ParsedProject, ProjectsByGenre, UnghRepo, Url } from './types.js';

const GITHUB_URL = `https://github.com`;
const UNGH_URL = `https://ungh.cc`;
const GITHUB_USERNAME = `ryoppippi`;

/**
 * Processes a single project: adds a link if missing, fetches repo info if description is missing.
 */
async function processProject(
	project: typeof Project.infer,
) {
	// Ensure project has a link
	if (project.link == null) {
		project.link = Url.assert(
			ufo.joinURL(GITHUB_URL, GITHUB_USERNAME, project.name),
		);
	}

	const link = Url.assert(project.link);

	// Fetch repo info if description is missing or null
	if (project.description == null) {
		try {
			const url = Url.assert(ufo.joinURL(
				UNGH_URL,
				'repos',
				GITHUB_USERNAME,
				project.name,
			));
			const res = await fetch(url);
			if (!res.ok) {
				throw new Error(`Failed to fetch repo info for ${project.name}: ${res.statusText}`);
			}

			const unghRepoData = await res.json();

			// Validate fetched data using ArkType
			const validatedGhRepo = UnghRepo.assert(unghRepoData);
			// Merge fetched repo info
			project = {
				...project,
				...validatedGhRepo.repo,
				link,
				slug: project.slug ?? `${GITHUB_USERNAME}-${project.name}`,
			} as const satisfies typeof ParsedProject.infer;
		}
		catch (e) {
			console.error(`Error fetching or processing repo info for project ${project.name}:`, e);
			// Continue with the original project data if fetch/processing fails
		}
	}

	return ParsedProject.assert(project);
}

/**
 * Fetches and processes project information, enriching it with GitHub repository data.
 */
export async function getProjects(): Promise<typeof ProjectsByGenre.inferOut> {
	const validatedOssProjects = OssProjects.assert(_ossProjects);

	// Process genres concurrently
	const processedEntries = await Promise.all(
		(Object.entries(validatedOssProjects) as Entries<typeof validatedOssProjects>).map(
			async ([genre, projects]) => {
				// Process projects within a genre concurrently
				const processedGenreProjects = await Promise.all(
					projects.map(async project => processProject(project)),
				);
				return [genre, processedGenreProjects] as const;
			},
		),
	);

	// Construct the final result object
	return ProjectsByGenre.assert(Object.fromEntries(processedEntries));
}
