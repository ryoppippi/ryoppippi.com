<script lang='ts'>
	const { title, place, link }: { title: string; place: string; link: string } = $props();
</script>

<div>
	{title}
	<span class='inline'>
		{#if link !== undefined}
			@<a class='underline hover:no-underline' href={link} target='_blank'>{place}</a>
		{:else}
			@{place}
		{/if}
	</span>
</div>
