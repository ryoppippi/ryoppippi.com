import { GITHUB_TOKEN } from '$env/static/private';
import { Octokit } from 'octokit';

let octokit: Octokit | undefined;

export function useOctokit(): Octokit {
	return octokit ?? new Octokit({
		auth: GITHUB_TOKEN as string ?? undefined,
	});
}
