<script lang="ts">
	import './WorksProse.css';

	const sections = [
		'oss',
		'showcase',
		'talks',
		'media',
		'publications',
	] as const satisfies readonly [string, ...string[]];

	type WorksNavProps = {
		active: (typeof sections)[number];
	};

	let { active }: WorksNavProps = $props();
</script>

<div class="worksNavigationHeader">
	<h1 class="worksTitle">Works</h1>
	<p class="worksTagline">
		<span class="worksNowrap">... that</span> <span class="worksNowrap">I</span>{' '}<span
			class="worksNowrap">(&rsquo;m working | &rsquo;ve worked)</span
		>{' '}<span class="worksNowrap">on</span>
	</p>
	<nav class="worksSections" aria-label="Works sections">
		{#each sections as item}
			<a
				class={`worksSectionLink${item === active ? ` worksSectionLinkActive` : ''}`}
				aria-current={item === active ? 'page' : undefined}
				href={`/works/${item}/`}
				style={`view-transition-name:works-nav-${item}`}
				>{#if item === 'oss'}{'OSS'}{:else}{item[0].toUpperCase() + item.slice(1)}{/if}</a
			>
		{/each}
	</nav>
</div>

<style>
	.worksNavigationHeader {
		text-align: center;
		font-family: var(--font-mono);
	}

	.worksTitle {
		padding-bottom: 1rem;
		font-size: 3rem;
		line-height: 1;
		font-weight: 700;
		opacity: 0.7;
	}

	.worksTagline {
		margin-bottom: 1.25rem;
		font-size: 1.125rem;
		font-style: italic;
		opacity: 0.5;
	}

	.worksNowrap {
		white-space: nowrap;
	}

	.worksSections {
		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
		gap: 0.25rem;
		justify-content: center;
		margin-bottom: 2rem;
		font-size: 1.875rem;
		line-height: 2.25rem;
	}

	.worksSectionLink {
		opacity: 0.2;
		transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.worksSectionLinkActive {
		opacity: 0.7;
	}

	@media (min-width: 40rem) {
		.worksSections {
			flex-direction: row;
			gap: 0.75rem;
		}
	}
</style>
