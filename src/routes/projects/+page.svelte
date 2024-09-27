<script lang='ts'>
	import ProjectTitle from './ProjectTitle.svelte';
	import OssProject from './OSSProject.svelte';
	import Title from '$lib/Title.svelte';

	const { data } = $props();
	const { projects } = data;
</script>

<Title title='projects' />

<div>
	<div text-center>
		<ProjectTitle />
	</div>

	<OssProject {projects} />
</div>
