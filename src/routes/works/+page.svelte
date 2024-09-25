<script lang='ts'>
	import { joinURL } from 'ufo';

	const { data } = $props();
	const { projects } = data;
</script>

you can also check <a href='https://ryoppippi.com/pr' target='_blank'>my reset PRs</a>

<div prose='~ dark:invert'>
	{#each Object.entries(projects) as [slug, project] (slug)}
		<h2>{slug}</h2>
		<!-- eslint-disable-next-line svelte/require-each-key -->
		{#each project as { name, description, icon, link }}
			<a href={link} target='_blank'>
				<!-- svelte-ignore element_invalid_self_closing_tag -->
				<h3 flex gap-1 items-center><span class={icon} />{name}</h3>
				<p>{description ?? ''} </p>
			</a>
		{/each}
	{/each}
</div>
