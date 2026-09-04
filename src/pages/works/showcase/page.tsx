import type { ShowcaseProject } from '@/content/index.ts';
import { formatDate } from '@/lib/util.ts';
import WorksNav from '@/pages/works/_components/WorksNav';
import styles from './Showcase.module.css';

type ShowcasePageProps = {
	projects: ShowcaseProject[];
};

/**
 * Renders showcase projects and their pre-rendered descriptions.
 *
 * @param props - Showcase projects to display.
 * @returns The project showcase fragment.
 */
export default function ShowcasePage({ projects }: ShowcasePageProps) {
	return (
		<>
			<WorksNav active="showcase" />
			<div class={styles.showcaseGrid}>
				{projects.map((project) => {
					const external = project.link.startsWith('http');
					return (
						<article class={styles.showcaseCard}>
							<a
								class={styles.showcaseImageLink}
								href={project.link}
								rel={external ? 'noopener noreferrer' : undefined}
								target={external ? '_blank' : undefined}
							>
								{project.image != null && (
									<img class={styles.showcaseImage} alt={project.title} src={project.image} />
								)}
							</a>
							<div class={styles.showcaseDetails}>
								<h2 class={styles.showcaseTitle}>
									<a
										href={project.link}
										rel={external ? 'noopener noreferrer' : undefined}
										target={external ? '_blank' : undefined}
									>
										{project.title}
									</a>
								</h2>
								<div class="prose" innerHTML={project.html} />
								<p class={styles.showcaseDate}>{formatDate(new Date(project.pubDate))}</p>
							</div>
						</article>
					);
				})}
			</div>
		</>
	);
}
