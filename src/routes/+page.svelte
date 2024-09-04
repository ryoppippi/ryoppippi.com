<script>
	import Profile from '$lib/Profile.svelte';
	import Social from '$lib/Social.svelte';
</script>

<article
	container
	grid
	mt-8
	place-content-center
>
	<Profile />
	<div mt-8>
		<h1
			font-bold
			mb-6
			text='4xl center'
		>
			<span
				block
				inline='sm:~'
			>
				@ryoppippi
			</span>
			<span
				font-medium
				text='center xl text-700 dark:text-200'
			>
				Engineer
			</span>
		</h1>
	</div>
</article>

<div
	container
	flex
	h-full
	items-center
	justify-center
	mxa
>
	<Social />
</div>
