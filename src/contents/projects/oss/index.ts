import type { Entries } from 'type-fest';
import type { Project } from './types.js';
import { joinURL } from 'ufo';
import _ossProjects from './list.json';
import { GHRes, OssProjects, ParsedProject, ProjectsByGenre } from './types.js';

const GITHUB_URL = `https://github.com`;

/**
 * Processes a single project: adds a link if missing, fetches repo info if description is missing.
 */
async function processProject(
	project: typeof Project.infer,
	fetchFn: typeof globalThis.fetch,
) {
	// Ensure project has a link
	if (project.link != null) {
		project.link = joinURL(GITHUB_URL, 'ryoppippi', project.name);
	}

	// Fetch repo info if description is missing or null
	if (project.description === undefined || project.description === null) {
		try {
			const unghURL = project.link?.replace(GITHUB_URL, 'https://ungh.cc/repos').trim() ?? '';
			// Basic URL check
			if (!unghURL.startsWith('https://')) {
				throw new Error(`Invalid URL format for ungh.cc fetch: ${unghURL}`);
			}

			const ghRepoRes = await fetchFn(unghURL);
			if (!ghRepoRes.ok) {
				throw new Error(`Failed to fetch ${unghURL}: ${ghRepoRes.statusText}`);
			}

			const ghRepoData = await ghRepoRes.json();

			// Validate fetched data using ArkType
			const validatedGhRepo = GHRes.assert(ghRepoData);
			// Merge fetched repo info
			project = {
				...project,
				...validatedGhRepo.repo,
			};
		}
		catch (e) {
			console.error(`Error fetching or processing repo info for project ${project.name}:`, e);
			// Continue with the original project data if fetch/processing fails
		}
	}

	// The final object needs to satisfy `Required<Project.infer> & GHRepo['repo']['infer']`.
	// We assume 'name' and 'icon' are present from the input (as per Project schema).
	// 'link' is added if missing.
	// 'description', 'stars', etc., are added from GHRepo if fetched successfully.
	// 'slug' remains optional as it wasn't added before.
	// We cast here, assuming the process populates the necessary fields.
	// Add runtime checks or a final validation step if stricter guarantees are needed.
	return ParsedProject.assert(project);
}

/**
 * Fetches and processes project information, enriching it with GitHub repository data.
 */
export async function getProjects(fetchFn: typeof globalThis.fetch = globalThis.fetch): Promise<typeof ProjectsByGenre.inferOut> {
	const validatedOssProjects = OssProjects.assert(_ossProjects);

	// Process genres concurrently
	const processedEntries = await Promise.all(
		(Object.entries(validatedOssProjects) as Entries<typeof validatedOssProjects>).map(
			async ([genre, projects]) => {
				// Process projects within a genre concurrently
				const processedGenreProjects = await Promise.all(
					projects.map(async project => processProject(project, fetchFn)),
				);
				return [genre, processedGenreProjects] as const;
			},
		),
	);

	// Construct the final result object
	return ProjectsByGenre.assert(Object.fromEntries(processedEntries));
}
