<script lang='ts'>
	export let title: string;

	export let place: string;

	export let link: string | null;
</script>

<div>
	{title}
	<span class='inline'>
		{#if link !== undefined}
			@<a href={link} class='underline hover:no-underline' target='_blank'>{place}</a>
		{:else}
			@{place}
		{/if}
	</span>
</div>
