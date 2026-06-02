<script lang='ts'>
	const apo = `&rsquo;`;
	const statement = [
		'... that',
		'I',
		`(${apo}m working | ${apo}ve worked)`,
		'on',
	].map(text => `<span class="text-nowrap">${text}</span>`).join(' ');

</script>

<div class='text-center font-mono'>
	<h1 class='pb-4 text-5xl font-bold opacity-70'
	>
		Projects
	</h1>
	<p class='mb-5 text-lg italic opacity-50'>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html statement}
	</p>

</div>
