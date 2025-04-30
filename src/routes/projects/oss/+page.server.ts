import type { PageServerLoad } from './$types';
import { getProjects } from '$contents/projects/oss';

export const load: PageServerLoad = async () => {
	const projects = await getProjects();
	return {
		projects,
		title: 'oss',
	};
};
