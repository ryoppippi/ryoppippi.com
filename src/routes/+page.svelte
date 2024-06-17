<script>
	import Profile from '$lib/Profile.svelte';
	import Social from '$lib/Social.svelte';
</script>

<article class='container mx-auto mt-8 grid place-content-center'>
	<Profile />
	<div class='mt-8'>
		<h1 class='mb-6 text-center text-4xl font-bold text-gray-800'>
			<span class='block text-me-text-100 xl:inline'>@ryoppippi</span>
			<span class='text-center text-xl font-medium text-me-text-200'>Engineer</span>
		</h1>
	</div>
</article>

<div class='container mx-auto flex h-full items-center justify-center'>
	<Social />
</div>
