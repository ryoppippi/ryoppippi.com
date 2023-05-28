<script>
	/** @type {string} */
	export let title;

	/** @type {string} */
	export let place;

	/** @type {string | undefined} */
	export let link = undefined;
</script>

<div>
	{title}
	<span class="inline">
		{#if link !== undefined}
			@<a href={link} class="underline hover:no-underline" target="_blank">{place}</a>
		{:else}
			@{place}
		{/if}
	</span>
</div>
