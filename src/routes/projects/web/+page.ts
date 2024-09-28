import { getProjects } from '$contents/projects/web' with { type: 'macro' };

export async function load() {
	return { projects: await getProjects() };
}
