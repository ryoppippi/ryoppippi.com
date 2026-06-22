<script lang='ts'>
	const socials = [
		['icon-[line-md--github-loop]', 'GitHub profile', '/github'],
		['icon-[ph--git-pull-request-duotone]', 'Recent pull requests', '/pr'],
		['icon-[line-md--linkedin]', 'LinkedIn profile', '/linkedin'],
		['icon-[line-md--twitter]', 'Twitter profile', '/twitter'],
		['icon-[simple-icons--bluesky]', 'Bluesky profile', '/bsky'],
		['icon-[ri--youtube-line]', 'YouTube channel', '/youtube'],
	] as const;
</script>

<article class='gcc container mx-auto mt-8'>
	<div class='w-full animate-[root-flip-in-x_1s_both]'>
		<img
			class='mx-auto aspect-square w-1/2 rounded-full object-contain view-transition-name---profile md:size-64'
			alt='ryoppippi'
			fetchpriority='high'
			height='400'
			loading='eager'
			src='/ryoppippi.avif'
			srcset='/ryoppippi-174.avif 174w, /ryoppippi-348.avif 348w, /ryoppippi.avif 400w'
			sizes='(min-width: 48rem) 256px, calc(50vw - 2rem)'
			width='400'
		/>
	</div>
	<div class='mt-8'>
		<h1 class='mb-6 text-center text-4xl font-bold' style='view-transition-name:title-ryoppippi'>
			<span class='block sm:inline'>@ryoppippi</span>
			<span class='animate-pulse text-center text-xl font-medium text-text-700 dark:text-text-200'>Engineer</span>
		</h1>
	</div>
</article>

<div class='fcc container mx-auto h-full'>
	<article class='gcc animate-[root-fade-in_3s_both] grid-cols-3 gap-3 sm:grid-cols-[repeat(6,minmax(0,1fr))]'>
		{#each socials as [icon, label, href] (href)}
			<div class='op-card transition-base hover:z-10 hover:scale-110 hover:bg-[#88888811] hover:opacity-100 hover:shadow-xl'>
				<a aria-label={label} href={`https://ryoppippi.com${href}`} rel='noopener noreferrer' target='_blank'>
					<span class={`${icon} text-[length:4.5vh]`} aria-hidden='true'></span>
				</a>
			</div>
		{/each}
	</article>
</div>
