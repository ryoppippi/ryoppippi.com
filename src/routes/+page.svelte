<script>
	import Profile from '$lib/Profile.svelte';
	import Social from '$lib/Social.svelte';
</script>

<article
	container
	grid
	mt-8
	mx-auto
	place-content-center
>
	<Profile />
	<div mt-8>
		<h1
			font-bold
			mb-6
			text='4xl center gray-800'
		>
			<span
				block
				inline='sm:~'
				text-text-100
			>
				@ryoppippi
			</span>
			<span
				font-medium
				text='center text-200 xl'
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
	mx-auto
>
	<Social />
</div>
