<script lang='ts'>
	let { active }: { active: string } = $props();
	const sections = ['oss', 'showcase', 'talks', 'publications'] as const;
</script>

<div class='text-center font-mono'>
	<h1 class='pb-4 text-5xl font-bold opacity-70'>Projects</h1>
	<p class='mb-5 text-lg italic opacity-50'>
		<span class='text-nowrap'>... that</span>
		<span class='text-nowrap'>I</span>
		<span class='text-nowrap'>(&rsquo;m working | &rsquo;ve worked)</span>
		<span class='text-nowrap'>on</span>
	</p>
	<nav class='fcol-sm-row fw mb-8 gap-1 text-3xl sm:gap-3' aria-label='Works sections'>
		{#each sections as item (item)}
			<a
				class:opacity-70={item === active}
				class:opacity-20={item !== active}
				aria-current={item === active ? 'page' : undefined}
				href={`/works/${item}/`}
			>
				{item === 'oss' ? 'Oss' : item[0].toUpperCase() + item.slice(1)}
			</a>
		{/each}
	</nav>
</div>
