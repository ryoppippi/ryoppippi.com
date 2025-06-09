import type { Entries } from 'type-fest';
import type { Project } from './types.js';
import { useOctokit } from '$lib/server/octokit.js';
import { joinURL } from 'ufo';
import ossProjects from './list.js';
import { ParsedProject, ProjectsByGenre, Repo, URL } from './types.js';

const GITHUB_URL = `https://github.com`;
const GITHUB_USERNAME = `ryoppippi`;

/**
 * Processes a single project: adds a link if missing, fetches repo info if description is missing.
 */
async function processProject(
	project: typeof Project.infer,
) {
	// Ensure project has a link
	if (project.link == null) {
		project.link = URL.assert(joinURL(GITHUB_URL, GITHUB_USERNAME, project.name));
	}

	const link = URL.assert(project.link);

	// Fetch repo info if description is missing or null
	if (project.description == null) {
		try {
			const { data: ghRepoData } = await useOctokit().rest.repos.get({
				owner: GITHUB_USERNAME,
				repo: project.name,
			});

			// Validate fetched data using ArkType
			const validatedGhRepo = Repo.assert(ghRepoData);
			// Merge fetched repo info
			project = {
				...project,
				...validatedGhRepo,
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
	// Process genres concurrently
	const processedEntries = await Promise.all(
		(Object.entries(ossProjects) as Entries<typeof ossProjects>).map(
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
