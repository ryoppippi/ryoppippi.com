<script lang='ts'>
	import WorksNav from './WorksNav.svelte';

	type Publication = { title: string; link: string; authors: string; publisher: string };
	let { publications }: { publications: Record<string, Publication[]> } = $props();
	const years = $derived(Object.entries(publications).sort(([a], [b]) => Number(b) - Number(a)));
</script>

<WorksNav active='publications' />

{#each years as [year, items] (year)}
	<section>
		<h2 class='f-text-32-64 my-8 font-mono font-bold leading-none text-stroke-aaa text-transparent opacity-35 dark:opacity-20'>{year}</h2>
		<ul class='mx-auto px-10'>
			{#each items as item (item.link)}
				<li class='my-5'>
					<a class='text-xl underline' href={item.link} rel='noopener noreferrer' target='_blank'>{item.title}</a>
					<p class='opacity-50'>{item.publisher}</p>
				</li>
			{/each}
		</ul>
	</section>
{/each}
