import type { OssProject, OssProjectKind } from '../sections.ts';
import { SITE_ORIGIN } from '../consts.ts';
import WorksNav from './WorksNav.tsx';

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
			<div class="prose mx-auto mt-10 pb-5 text-center dark:prose-invert">
				<div class="fxc gap-2">
					<a
						class="btn-green fcol-md-row fyc gap-1"
						href={`${SITE_ORIGIN}/pr`}
						rel="noopener noreferrer"
						target="_blank"
					>
						<span class="icon-[ph--git-pull-request-duotone]" aria-hidden="true" />
						My Recent PRs
					</a>
					<a
						class="btn-blue fcol-md-row fyc gap-1"
						href={`${SITE_ORIGIN}/gh`}
						rel="noopener noreferrer"
						target="_blank"
					>
						<span class="icon-[ph--github-logo-duotone]" aria-hidden="true" />
						GitHub
					</a>
					<a
						class="btn-pink fcol-md-row fyc gap-1"
						href={`${SITE_ORIGIN}/gh-by-stars`}
						rel="noopener noreferrer"
						target="_blank"
					>
						<span class="icon-[ph--star]" aria-hidden="true" />
						Sort by Stars
					</a>
				</div>
				<p class="mt-3 text-xs opacity-60">
					GitHub star counts for my repositories are refreshed daily.
				</p>
			</div>

			<div class="mt-12 grid gap-16">
				{projectGroups.map((group) => {
					const groupProjects = projects.filter((project) => project.kind === group.kind);
					return groupProjects.length > 0 ? (
						<section>
							<h2 class="f-text-32-64 my-8 font-mono font-bold leading-none text-stroke-aaa text-transparent opacity-35 dark:opacity-20">
								{group.title}
							</h2>
							<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
								{groupProjects.map((project) => (
									<a
										class="grid grid-cols-5 max-w-full select-none font-sans no-underline op-card transition-base hover:scale-[1.01] hover:shadow-xl"
										href={project.link}
										rel="noopener noreferrer"
										target="_blank"
									>
										<div class="gcc">
											<span class={`${project.icon} text-3xl opacity-50`} aria-hidden="true" />
										</div>
										<div class="fcol col-span-4 gap-2">
											<div class="fyc justify-between gap-2">
												<div class="truncate text-lg">{project.name}</div>
												{project.stars != null && (
													<span
														class="fyc shrink-0 gap-1 text-sm opacity-75"
														aria-label={`${project.stars.toLocaleString('en-US')} GitHub stars`}
														title={`${project.stars.toLocaleString('en-US')} GitHub stars`}
													>
														<span class="icon-[ph--star] text-base" aria-hidden="true" />
														{formatStars(project.stars)}
													</span>
												)}
											</div>
											<p class="min-h-8 line-clamp-2 text-xs">{project.description ?? ''}</p>
											<div class="fyc fw gap-1">
												{project.tags.map((tag) => (
													<span class="rounded border border-base px-1.5 py-0.5 font-mono text-[0.65rem] leading-none opacity-70">
														{tag}
													</span>
												))}
											</div>
										</div>
									</a>
								))}
							</div>
						</section>
					) : null;
				})}
			</div>
		</>
	);
}
