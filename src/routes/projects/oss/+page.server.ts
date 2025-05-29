import type { PageServerLoad } from './$types';
import { getProjects } from '$contents/projects/oss/index.compile';

export const load: PageServerLoad = async () => {
	const projects = await getProjects();
	return {
		projects,
		title: 'oss',
	};
};
