<script lang="ts">
	import { SITE_ORIGIN } from '@/config/site.ts';

	import WorksNav from '@/components/WorksNav/index.svelte';

	import WorksSection from '@/components/WorksSection/index.svelte';
	import WorksList from '@/components/WorksSection/WorksList.svelte';

	import type { OssProject, OssProjectKind } from './data.ts';

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

	let { projects }: OssProps = $props();
</script>

<WorksNav active="oss"></WorksNav>
<div class="ossIntro">
	<div class="ossActions">
		<a
			class={['ossAction', 'ossActionGreen']}
			href={`${SITE_ORIGIN}/pr`}
			rel="noopener noreferrer"
			target="_blank"
		>
			<span class="icon-[ph--git-pull-request-duotone]" aria-hidden="true"></span>
			My Recent PRs
		</a>
		<a
			class={['ossAction', 'ossActionBlue']}
			href={`${SITE_ORIGIN}/gh`}
			rel="noopener noreferrer"
			target="_blank"
		>
			<span class="icon-[ph--github-logo-duotone]" aria-hidden="true"></span>
			GitHub
		</a>
		<a
			class={['ossAction', 'ossActionPink']}
			href={`${SITE_ORIGIN}/gh-by-stars`}
			rel="noopener noreferrer"
			target="_blank"
		>
			<span class="icon-[ph--star]" aria-hidden="true"></span>
			Sort by Stars
		</a>
	</div>
	<p class="ossUpdatedNote">GitHub star counts for my repositories are refreshed daily.</p>
</div>
<div class="ossGroups">
	{#each projectGroups as group}
		{const groupProjects = $derived(projects.filter((project) => project.kind === group.kind))}
		{#if groupProjects.length > 0}
			<WorksSection title={group.title}>
				<div class="ossProjectGrid">
					{#each groupProjects as project}
						<a class="ossProject" href={project.link} rel="noopener noreferrer" target="_blank">
							<div class="ossProjectIcon">
								<span class={[project.icon, 'ossProjectIconGlyph']} aria-hidden="true"></span>
							</div>
							<div class="ossProjectBody">
								<div class="ossProjectHeading">
									<div class="ossProjectName">{project.name}</div>
									{#if project.stars != null}
										<span
											class="ossProjectStars"
											aria-label={`${project.stars.toLocaleString('en-US')} GitHub stars`}
											title={`${project.stars.toLocaleString('en-US')} GitHub stars`}
										>
											<span class={['icon-[ph--star]', 'ossStarIcon']} aria-hidden="true"></span>
											{formatStars(project.stars)}
										</span>
									{/if}
								</div>
								<p class="ossProjectDescription">{project.description ?? ''}</p>
								<div class="ossProjectTags">
									{#each project.tags as tag}
										<span class="ossProjectTag">{tag}</span>
									{/each}
								</div>
							</div>
						</a>
					{/each}
				</div>
			</WorksSection>
		{/if}
	{/each}
</div>

<style>
	.ossIntro {
		margin: 2.5rem auto 0;
		padding-bottom: 1.25rem;
		text-align: center;
	}

	.ossActions {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
	}

	.ossAction {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		border: 1px solid #8884;
		border-radius: 0.25rem;
		padding: 0.25rem 0.625rem;
		opacity: 0.5;
		text-decoration: none;
		transition:
			color 0.2s ease-out,
			background-color 0.2s ease-out,
			opacity 0.2s ease-out;
	}

	.ossAction:hover {
		opacity: 1;
	}

	.ossActionBlue:hover {
		background-color: #60a5fa1a;
		color: #60a5fa;
	}

	.ossActionGreen:hover {
		background-color: #4ade801a;
		color: #4ade80;
	}

	.ossActionPink:hover {
		background-color: #f472b61a;
		color: #f472b6;
	}

	.ossUpdatedNote {
		margin-top: 0.75rem;
		font-size: 0.75rem;
		opacity: 0.6;
	}

	.ossGroups {
		display: grid;
		gap: 4rem;
		margin-top: 3rem;
	}

	.ossProjectGrid {
		display: grid;
		grid-template-columns: repeat(1, minmax(0, 1fr));
		gap: 2rem;
	}

	.ossProject {
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		max-width: 100%;
		user-select: none;
		font-family: var(--font-sans);
		opacity: 0.7;
		text-decoration: none;
		transition:
			opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
			transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
			box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.ossProject:hover {
		opacity: 0.8;
		transform: scale(1.01);
		box-shadow:
			0 20px 25px -5px rgb(0 0 0 / 10%),
			0 8px 10px -6px rgb(0 0 0 / 10%);
	}

	.ossProjectIcon {
		display: grid;
		place-content: center;
		place-items: center;
	}

	.ossProjectIconGlyph {
		font-size: 1.875rem;
		opacity: 0.5;
	}

	.ossProjectBody {
		display: flex;
		grid-column: span 4 / span 4;
		flex-direction: column;
		gap: 0.5rem;
	}

	.ossProjectHeading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.ossProjectName {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 1.125rem;
		line-height: 1.75rem;
	}

	.ossProjectStars {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		gap: 0.25rem;
		font-size: 0.875rem;
		opacity: 0.75;
	}

	.ossStarIcon {
		font-size: 1rem;
	}

	.ossProjectDescription {
		min-height: 2rem;
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		font-size: 0.75rem;
		line-height: 1.5;
	}

	.ossProjectTags {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	.ossProjectTag {
		border: 1px solid #8884;
		border-radius: 0.25rem;
		padding: 0.125rem 0.375rem;
		font-family: var(--font-mono);
		font-size: 0.65rem;
		line-height: 1;
		opacity: 0.7;
	}

	:global(html.dark) .ossProject {
		opacity: 0.5;
	}

	:global(html.dark) .ossProject:hover {
		opacity: 0.8;
	}

	@media (prefers-color-scheme: dark) {
		:global(html:not(.js)) .ossProject {
			opacity: 0.5;
		}

		:global(html:not(.js)) .ossProject:hover {
			opacity: 0.8;
		}
	}

	@media (min-width: 48rem) {
		.ossAction {
			flex-direction: row;
		}

		.ossProjectGrid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
