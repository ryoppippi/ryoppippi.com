<script>
	import Profile from '$lib/Profile.svelte';
	import Social from '$lib/Social.svelte';
</script>

<article
	container
	gcc
	mt8
	mxa
>
	<div animate='duration-1000 keyframes-flip-in-x'>
		<Profile />
	</div>
	<div mt8>
		<h1
			style:view-transition-name='title-ryoppippi'
			font-bold
			mb6
			text='4xl center'
		>
			<span
				block
				inline='sm:~'
			>
				@ryoppippi
			</span>
			<span
				animate-pulse
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
	fcc
	h-full
	mxa
>
	<Social />
</div>
