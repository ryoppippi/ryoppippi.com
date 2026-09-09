<script lang="ts">
	import ProfileImage from '@/components/ProfileImage/index.svelte';

	import { SITE_ORIGIN } from '@/config/site.ts';

	import { SITE_OWNER } from '@/config/site-owner.ts';

	const links = [
		['GitHub', `${SITE_ORIGIN}/github`],
		['LinkedIn', `${SITE_ORIGIN}/linkedin`],
		['Twitter', `${SITE_ORIGIN}/twitter`],
		['Bluesky', `${SITE_ORIGIN}/bsky`],
		['YouTube', `${SITE_ORIGIN}/youtube`],
		['CV', '/cv'],
	] as const satisfies readonly (readonly [label: string, href: string])[];
</script>

<article class="page">
	<section class="profileCard">
		<div class="cardRule" aria-hidden="true"></div>
		<div class="cardContent">
			<div class="visuals">
				<figure class="portrait"><ProfileImage class="profileImage"></ProfileImage></figure>
				<figure class="mascot">
					<img
						class="mascotImage"
						alt="haichu"
						decoding="async"
						height="529"
						loading="eager"
						src="/haichu.avif"
						style="view-transition-name:about-haichu"
						width="1011"
					/>
				</figure>
			</div>
			<div class="copy">
				<h1 class="heading">ryoppippi</h1>
				<p class="kicker"><em>... coder without ai</em></p>
				<p class="description">
					<strong class="name">{SITE_OWNER.handle.slice(1)}</strong>{' '}<span class="alias"
						>({SITE_OWNER.name} / <span lang="ja">{SITE_OWNER.japaneseName}</span>)</span
					>{' '}builds coding agents, developer tools, and human-centred AI products. Maintains{' '}<a
						class="inlineLink"
						href="https://ccusage.com/gh"
						rel="noopener noreferrer"
						target="_blank">ccusage</a
					>{' '}and{' '}<a class="inlineLink" href="/works/oss/">multiple OSS projects</a>.
					<span class="role">Founding Engineer</span>
					at{' '}<a
						class="inlineLink"
						href="https://rork.com/"
						rel="noopener noreferrer"
						target="_blank">Rork</a
					>.
				</p>
				<ul class="links">
					{#each links as [label, href]}
						<li class="linkItem">
							<a class="link" {href} rel="noopener noreferrer" target="_blank"
								><span>{label}</span><span class="linkArrow" aria-hidden="true">↗</span></a
							>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</section>
</article>

<style>
	.profileCard {
		position: relative;
		isolation: isolate;
		overflow: hidden;
		border: 1px solid #8884;
		border-radius: 2rem;
		padding: 2.5rem 1.25rem;
		background:
			radial-gradient(circle at 50% 0%, rgb(255 107 107 / 8%), transparent 32rem),
			linear-gradient(135deg, rgb(136 136 136 / 6%), transparent 50%);
		box-shadow: 0 2rem 6rem #00000012;
	}

	.page {
		max-width: 56rem;
		margin: 2rem auto 0;
		padding: 0 0.5rem 5rem;
	}

	.cardRule {
		position: absolute;
		top: 0;
		right: 3rem;
		left: 3rem;
		height: 1px;
		pointer-events: none;
		background-color: var(--color-accent-100);
		opacity: 0.5;
	}

	.cardContent {
		position: relative;
	}

	.visuals {
		display: grid;
		max-width: 20rem;
		gap: 1rem;
		margin-inline: auto;
	}

	.portrait,
	.mascot {
		margin: 0;
	}

	.portrait :global(.profileImage) {
		display: block;
		width: 50%;
		max-width: 100%;
		aspect-ratio: 1;
		height: auto;
		margin-inline: auto;
		border: 1px solid #8885;
		border-radius: 9999px;
		object-fit: contain;
		box-shadow: 0 1.5rem 4rem #0004;
		view-transition-name: name---profile;
	}

	.mascotImage {
		display: block;
		width: 80%;
		max-width: 16rem;
		height: auto;
		margin-inline: auto;
		object-fit: contain;
		opacity: 0.85;
		filter: drop-shadow(0 1rem 2rem #0003);
		transition:
			transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
			opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.mascotImage:hover {
		opacity: 1;
		transform: scale(1.02);
	}

	.copy {
		max-width: 42rem;
		margin: 2.5rem auto 0;
		border-top: 1px solid #8884;
		padding-top: 2rem;
	}

	.heading {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}

	.kicker {
		font-family: var(--font-mono);
		font-size: 1.125rem;
		font-style: italic;
		color: var(--color-text-400);
		opacity: 0.6;
	}

	.description {
		margin-top: 1.25rem;
		text-wrap: pretty;
		font-size: 1.125rem;
		line-height: 2rem;
		color: var(--color-text-600);
	}

	.name {
		font-weight: 600;
		color: var(--color-text-800);
	}

	.alias {
		font-family: var(--font-mono);
		font-size: 0.875rem;
		color: var(--color-text-400);
	}

	.inlineLink {
		font-weight: 500;
		color: inherit;
		text-decoration: underline;
		text-decoration-color: #8886;
		text-underline-offset: 4px;
		transition:
			color 0.5s cubic-bezier(0.4, 0, 0.2, 1),
			text-decoration-color 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.inlineLink:hover {
		text-decoration-color: var(--color-accent-100);
	}

	.role {
		font-weight: 500;
		color: var(--color-text-700);
	}

	.links {
		display: grid;
		gap: 0 2.5rem;
		margin-top: 2.5rem;
		padding: 0;
		list-style: none;
	}

	.linkItem {
		border-bottom: 1px solid #8884;
	}

	.link {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-block: 0.75rem;
		font-family: var(--font-mono);
		font-size: 0.875rem;
		color: var(--color-text-500);
		text-decoration: none;
		transition:
			color 0.5s cubic-bezier(0.4, 0, 0.2, 1),
			opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.link:hover {
		color: var(--color-accent-100);
	}

	.linkArrow {
		opacity: 0.25;
		transition:
			transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
			opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.link:hover .linkArrow {
		opacity: 0.8;
		transform: translateX(0.25rem);
	}

	:global(html.dark) .profileCard {
		box-shadow: 0 2rem 6rem #00000045;
	}

	:global(html.dark) .description {
		color: var(--color-text-300);
	}

	:global(html.dark) .name {
		color: var(--color-text-100);
	}

	:global(html.dark) .role {
		color: var(--color-text-200);
	}

	:global(html.dark) .link {
		color: var(--color-text-300);
	}

	@media (prefers-color-scheme: dark) {
		:global(html:not(.js)) .profileCard {
			box-shadow: 0 2rem 6rem #00000045;
		}

		:global(html:not(.js)) .description {
			color: var(--color-text-300);
		}

		:global(html:not(.js)) .name {
			color: var(--color-text-100);
		}

		:global(html:not(.js)) .role {
			color: var(--color-text-200);
		}

		:global(html:not(.js)) .link {
			color: var(--color-text-300);
		}
	}

	@media (min-width: 40rem) {
		.profileCard {
			padding: 3rem 2.5rem;
		}

		.description {
			font-size: 1.25rem;
			line-height: 2.25rem;
		}

		.links {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 48rem) {
		.portrait :global(.profileImage) {
			width: 16rem;
			height: 16rem;
		}
	}
</style>
