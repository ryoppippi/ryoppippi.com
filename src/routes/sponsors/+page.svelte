<script lang='ts'>
	import Icon from '$components/Icon.svelte';
	import './page.css';

	const sponsorViews = [
		{
			id: 'circles',
			label: 'Sponsor Circles',
			src: 'https://cdn.jsdelivr.net/gh/ryoppippi/sponsors@main/sponsors.circles.svg',
			alt: 'GitHub Sponsors',
		},
		{
			id: 'tiers',
			label: 'Sponsor Tiers',
			src: 'https://cdn.jsdelivr.net/gh/ryoppippi/sponsors@main/sponsors.past.svg',
			alt: 'Sponsor Tiers',
		},
	] as const;

	type View = (typeof sponsorViews)[number]['id'];

	let currentView: View = $state('circles');

	const currentImage = $derived(
		sponsorViews.find(view => view.id === currentView),
	);
</script>

<div class='fcol container mx-auto gap-8 py-8'>
	<h1 class='sr-only'>Sponsors</h1>

	<p class='op-card'>
		Thank you to everyone supporting my work—it keeps the OSS, blog, and talks
		alive.
	</p>

	<p>
		<a
			class='inline-flex items-center gap-2 btn-pink'
			href='https://github.com/sponsors/ryoppippi'
			rel='noreferrer'
			target='_blank'
		>
			<Icon class='icon-[ph--heart]' aria-hidden='true' />
			GitHub Sponsors
		</a>
	</p>

	<div class='fcol-sm-row fw gap-1 text-2xl sm:gap-3'>
		{#each sponsorViews as view (view.id)}
			{@const isCurrent = currentView === view.id}
			<button
				class={[
					'cursor-pointer border-none bg-transparent p-0 opacity-20',
					{ 'opacity-70 text-text-100': isCurrent },
				]}
				aria-pressed={isCurrent}
				onclick={() => (currentView = view.id)}
				type='button'
			>
				{view.label}
			</button>
		{/each}
	</div>

	<div class='fyc'>
		<img
			style:view-transition-name={`sponsor-${currentView}`}
			class='mx-auto h-auto w-full max-w-5xl'
			alt={currentImage?.alt}
			decoding='async'
			loading='lazy'
			src={currentImage?.src}
		/>
	</div>
</div>
