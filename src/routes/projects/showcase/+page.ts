import { getProjects } from '$contents/projects/showcase/index.compile';

export function load() {
	return {
		projects: getProjects(),
		title: 'showcase',
	};
}
