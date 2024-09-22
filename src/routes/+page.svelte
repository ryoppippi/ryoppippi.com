<script>
	import Profile from '$lib/Profile.svelte';
	import Social from '$lib/Social.svelte';
</script>

<article
	container
	grid
	mt8
	mxa
	place-content-center
>
	<div animate='duration-1000 keyframes-flip-in-x'>
		<Profile />
	</div>
	<div mt8>
		<h1
			font-bold
			mb6
			text='4xl center'
			view-transition--title
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
