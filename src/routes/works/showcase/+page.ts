import { getProjects } from '$contents/works/showcase';

export function load() {
	return {
		projects: getProjects(),
		title: 'showcase',
	};
}
