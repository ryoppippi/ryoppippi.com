import type { PageServerLoad } from './$types';
import { getProjects } from '$contents/projects/oss';

export const load: PageServerLoad = async ({ fetch }) => {
	const projects = await getProjects(fetch);
	return {
		projects,
	};
};
