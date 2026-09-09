<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		filter?: 'media' | 'talk';
		title: string | number;
	};

	let { children, filter, title }: Props = $props();
</script>

<section
	data-media-year={filter === 'media' ? true : undefined}
	data-talk-year={filter === 'talk' ? true : undefined}
>
	<h2 class="worksYear">{title}</h2>
	{@render children()}
</section>

<style>
	.worksYear {
		margin-block: 2rem;
		font-family: var(--font-mono);
		font-size: clamp(2rem, 1.2958rem + 3.0047vw, 4rem);
		line-height: 1;
		font-weight: 700;
		color: transparent;
		-webkit-text-stroke: 1.5px #aaaaaa;
		opacity: 0.35;
	}

	:global(html.dark) .worksYear {
		opacity: 0.5;
	}

	@media (prefers-color-scheme: dark) {
		:global(html:not(.js)) .worksYear {
			opacity: 0.5;
		}
	}
</style>
