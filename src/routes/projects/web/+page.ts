import type { PageLoad } from './$types';

type EnhancedImg = typeof import('*.png?enhanced').default;

export const load = (({ data }) => {
	const images: Record<string, { default: EnhancedImg }> = import.meta.glob('$contents/projects/web/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp,svg}', { eager: true, query: { enhanced: true } });
	const projects = data.projects.map((project) => {
		const [_, enhancedImg] = Object.entries(images).find(([key]) => project.image != null && project.image.endsWith(key)) ?? [];
		return {
			...project,
			image: enhancedImg,
		};
	});

	return { projects };
}) satisfies PageLoad;
