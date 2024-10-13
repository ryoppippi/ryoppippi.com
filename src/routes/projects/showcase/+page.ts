import { allShowcases } from '$content-collections';
import { getProjects } from '$contents/projects/showcase';

export function load() {
	return {
		projects: allShowcases,
		title: 'showcase',
	};
}
