import { building } from '$app/environment';
import { env } from '$env/dynamic/private';
import * as staticEnv from '$env/static/private';
import DataLoader from 'dataloader';
import { Octokit } from 'octokit';

let octokit: Octokit | undefined;
let repoLoader: DataLoader<{ owner: string; repo: string }, RepoInfo | null> | undefined;

export function useOctokit(): Octokit {
	if (octokit == null) {
		octokit = new Octokit({
			auth: !building ? env.GITHUB_TOKEN : (staticEnv.GITHUB_TOKEN !== '' ? staticEnv.GITHUB_TOKEN : undefined),
		});
	}
	return octokit;
}

type RepoInfo = {
	id: number;
	node_id: string;
	name: string;
	full_name: string;
	description: string | null;
	html_url: string;
	language: string | null;
	stargazers_count: number;
	forks_count: number;
	open_issues_count: number;
};

type GraphQLRepoResponse = {
	id: number;
	node_id: string;
	name: string;
	full_name: string;
	description: string | null;
	html_url: string;
	language: { name: string } | null;
	stargazers_count: number;
	forks_count: number;
	open_issues_count: { totalCount: number };
};

export function useRepoLoader() {
	if (repoLoader == null) {
		repoLoader = new DataLoader(
			async (keys) => {
				const octokit = useOctokit();

				// Build GraphQL query for batch fetching
				const fragments = keys.map((key, i) => `
					repo${i}: repository(owner: "${key.owner}", name: "${key.repo}") {
						id: databaseId
						node_id: id
						name
						full_name: nameWithOwner
						description
						html_url: url
						language: primaryLanguage {
							name
						}
						stargazers_count: stargazerCount
						forks_count: forkCount
						open_issues_count: issues(states: OPEN) {
							totalCount
						}
					}
				`).join('\n');

				const query = `
					query BatchRepositories {
						${fragments}
					}
				`;

				try {
					const result = await octokit.graphql<Record<string, GraphQLRepoResponse | null>>(query);

					return keys.map((_, i) => {
						const data = result[`repo${i}`];
						if (data == null) {
							return null;
						}

						// Transform GraphQL response to match REST API format
						return {
							id: data.id,
							node_id: data.node_id,
							name: data.name,
							full_name: data.full_name,
							description: data.description,
							html_url: data.html_url,
							language: data.language?.name ?? null,
							stargazers_count: data.stargazers_count,
							forks_count: data.forks_count,
							open_issues_count: data.open_issues_count.totalCount,
						};
					});
				}
				catch (error) {
					console.error('Failed to fetch repositories via GraphQL:', error);
					return keys.map(() => null);
				}
			},
			{
				// Cache results for the duration of the request
				cacheKeyFn: ({ owner, repo }) => `${owner}/${repo}`,
				// Batch window of 10ms to collect multiple requests
				batchScheduleFn: callback => setTimeout(callback, 10),
			},
		);
	}
	return repoLoader;
}
