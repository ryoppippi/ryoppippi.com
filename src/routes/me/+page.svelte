<script>
	import Profile from '$lib/Profile.svelte';
	import Experience from './Experience.svelte';
	import Education from './Education.svelte';
	import Skills from './Skills.svelte';
</script>

<div class="container mx-auto mt-8 grid place-content-center">
	<Profile />

	<Education />
	<Experience />
	<Skills />
</div>
