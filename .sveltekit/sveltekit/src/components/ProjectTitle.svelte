<script lang='ts'>
	const apo = `&rsquo;`;
	const statement = [
		'... that',
		'I',
		`(${apo}m working | ${apo}ve worked)`,
		'on',
	].map(text => `<span text-nowrap>${text}</span>`).join(' ');

</script>

<div font-mono text-center>
	<h1
		font-bold
		pb-4
		text-5xl
	>
		Projects
	</h1>
	<p italic mb5 op50 text-lg>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html statement}
	</p>

</div>
