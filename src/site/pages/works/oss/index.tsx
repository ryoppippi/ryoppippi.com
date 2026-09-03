import { SITE_ORIGIN } from '@/site/consts.ts';
import WorksNav from '@/site/pages/works/_components/WorksNav/index.tsx';
import WorksSection from '@/site/pages/works/_components/WorksSection/index.tsx';
import type { OssProject, OssProjectKind } from '@/site/sections.ts';
import styles from './Oss.module.css';

type OssProps = {
	projects: OssProject[];
};

const projectGroups = [
	{ kind: 'project', title: 'My Projects' },
	{ kind: 'contribution', title: 'Upstream Contributions' },
] as const satisfies ReadonlyArray<{ kind: OssProjectKind; title: string }>;

function formatStars(stars: number): string {
	return new Intl.NumberFormat('en', {
		maximumFractionDigits: 1,
		notation: 'compact',
	}).format(stars);
}

/**
 * Renders open-source projects and upstream contributions.
 *
 * @param props - Projects to group and display.
 * @returns The OSS page fragment.
 */
export default function Oss({ projects }: OssProps) {
	return (
		<>
			<WorksNav active="oss" />
			<div class={styles.ossIntro}>
				<div class={styles.ossActions}>
					<a
						class={`${styles.ossAction} ${styles.ossActionGreen}`}
						href={`${SITE_ORIGIN}/pr`}
						rel="noopener noreferrer"
						target="_blank"
					>
						<span class="icon-[ph--git-pull-request-duotone]" aria-hidden="true" />
						My Recent PRs
					</a>
					<a
						class={`${styles.ossAction} ${styles.ossActionBlue}`}
						href={`${SITE_ORIGIN}/gh`}
						rel="noopener noreferrer"
						target="_blank"
					>
						<span class="icon-[ph--github-logo-duotone]" aria-hidden="true" />
						GitHub
					</a>
					<a
						class={`${styles.ossAction} ${styles.ossActionPink}`}
						href={`${SITE_ORIGIN}/gh-by-stars`}
						rel="noopener noreferrer"
						target="_blank"
					>
						<span class="icon-[ph--star]" aria-hidden="true" />
						Sort by Stars
					</a>
				</div>
				<p class={styles.ossUpdatedNote}>
					GitHub star counts for my repositories are refreshed daily.
				</p>
			</div>

			<div class={styles.ossGroups}>
				{projectGroups.map((group) => {
					const groupProjects = projects.filter((project) => project.kind === group.kind);
					return groupProjects.length > 0 ? (
						<WorksSection title={group.title}>
							<div class={styles.ossProjectGrid}>
								{groupProjects.map((project) => (
									<a
										class={styles.ossProject}
										href={project.link}
										rel="noopener noreferrer"
										target="_blank"
									>
										<div class={styles.ossProjectIcon}>
											<span
												class={`${project.icon} ${styles.ossProjectIconGlyph}`}
												aria-hidden="true"
											/>
										</div>
										<div class={styles.ossProjectBody}>
											<div class={styles.ossProjectHeading}>
												<div class={styles.ossProjectName}>{project.name}</div>
												{project.stars != null && (
													<span
														class={styles.ossProjectStars}
														aria-label={`${project.stars.toLocaleString('en-US')} GitHub stars`}
														title={`${project.stars.toLocaleString('en-US')} GitHub stars`}
													>
														<span
															class={`icon-[ph--star] ${styles.ossStarIcon}`}
															aria-hidden="true"
														/>
														{formatStars(project.stars)}
													</span>
												)}
											</div>
											<p class={styles.ossProjectDescription}>{project.description ?? ''}</p>
											<div class={styles.ossProjectTags}>
												{project.tags.map((tag) => (
													<span class={styles.ossProjectTag}>{tag}</span>
												))}
											</div>
										</div>
									</a>
								))}
							</div>
						</WorksSection>
					) : null;
				})}
			</div>
		</>
	);
}
