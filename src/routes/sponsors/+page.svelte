<script lang='ts'>
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

<div container fcol gap-8 mxa py-8>
	<p op-card>
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
			<span class='i-ph-heart' />
			GitHub Sponsors
		</a>
	</p>

	<div fcol-sm-row fw gap='1 sm:3' text-2xl>
		{#each sponsorViews as view (view.id)}
			{@const isCurrent = currentView === view.id}
			<button
				class={{
					'op70 text-text-100': isCurrent,
				}}
				aria-pressed={isCurrent}
				bg-transparent
				border-none
				cursor-pointer
				onclick={() => (currentView = view.id)}
				op20
				p-0
				type='button'
			>
				{view.label}
			</button>
		{/each}
	</div>

	<div fyc>
		<img
			style:view-transition-name={`sponsor-${currentView}`}
			class='mx-auto h-auto max-w-5xl w-full'
			alt={currentImage?.alt}
			decoding='async'
			loading='lazy'
			src={currentImage?.src}
		/>
	</div>
</div>
