import type { ShowcaseProject } from '../../pages/works/showcase/index.ts';
import { formatDate } from '../../lib/util.ts';
import WorksNav from './WorksNav.tsx';

type ShowcaseProps = {
	projects: ShowcaseProject[];
};

/**
 * Renders showcase projects and their pre-rendered descriptions.
 *
 * @param props - Showcase projects to display.
 * @returns The project showcase fragment.
 */
export default function Showcase({ projects }: ShowcaseProps) {
	return (
		<>
			<WorksNav active="showcase" />
			<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
				{projects.map((project) => {
					const external = project.link.startsWith('http');
					return (
						<article class="group overflow-hidden rounded-lg border border-base transition-base hover:scale-[1.01] hover:shadow-xl">
							<a
								href={project.link}
								rel={external ? 'noopener noreferrer' : undefined}
								target={external ? '_blank' : undefined}
							>
								{project.image != null && (
									<img
										class="aspect-video w-full border-b border-base object-cover"
										alt={project.title}
										src={project.image}
									/>
								)}
							</a>
							<div class="p-4 op-card">
								<h2 class="text-2xl">
									<a
										href={project.link}
										rel={external ? 'noopener noreferrer' : undefined}
										target={external ? '_blank' : undefined}
									>
										{project.title}
									</a>
								</h2>
								<div class="prose dark:prose-invert" innerHTML={project.html} />
								<p class="pt-2 text-sm opacity-50">{formatDate(new Date(project.pubDate))}</p>
							</div>
						</article>
					);
				})}
			</div>
		</>
	);
}
