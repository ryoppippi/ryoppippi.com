import { getProjects } from '$contents/projects/web';

export async function load() {
	return { projects: await getProjects() };
}
