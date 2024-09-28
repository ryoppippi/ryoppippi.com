import { parseFilename } from 'ufo';
import type { PageLoad } from './$types';

type EnhancedImg = typeof import('*.png?enhanced').default;

export const load = (({ data }) => {
	const images: Record<string, { default: EnhancedImg }> = import.meta.glob('$contents/projects/showcase/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp,svg}', { eager: true, query: { enhanced: true } });
	const projects = data.projects.map((project) => {
		const [_, enhancedImg] = Object.entries(images).find(([key]) => (parseFilename(key, { strict: true }) === parseFilename(project.image, { strict: true }))) ?? [];
		if (enhancedImg == null) {
			console.error(`Image not found for project: ${project.title}`);
		}
		return {
			...project,
			image: enhancedImg,
		};
	});

	return { projects };
}) satisfies PageLoad;
