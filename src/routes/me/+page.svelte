<script>
	import Profile from '$lib/Profile.svelte';
	import Experience from './Experience.svelte';
	import Education from './Education.svelte';
	import Skills from './Skills.svelte';
</script>

<div class="container mx-auto my-3 mt-8 grid place-content-center">
	<Profile />

	<div class="mx-10">
		<Education />
		<Experience />
		<Skills />
	</div>
</div>
