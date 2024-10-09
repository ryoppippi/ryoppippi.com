import { getProjects } from '$contents/projects/showcase';

export function load() {
	return { projects: getProjects() };
}
