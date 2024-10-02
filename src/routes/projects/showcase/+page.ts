import { getProjects } from '$contents/projects/showcase';

export async function load() {
	return { projects: await getProjects() };
}
