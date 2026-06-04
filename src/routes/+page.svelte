<script>
	import Profile from '$components/Profile.svelte';
	import Social from '$components/Social.svelte';
	import './page.css';
</script>

<article class='gcc container mx-auto mt-8'
>
	<div class='animate-[root-flip-in-x_1s_both]'>
		<Profile />
	</div>
	<div class='mt-8'>
		<h1
			style:view-transition-name='title-ryoppippi'
			class='mb-6 text-center text-4xl font-bold'
		>
			<span class='block sm:inline'
			>
				@ryoppippi
			</span>
			<span
				class={[
					'animate-pulse',
					'text-center',
					['text-xl', 'font-medium'],
					['text-text-700', 'dark:text-text-200'],
				]}
			>
				Engineer

			</span>

		</h1>
	</div>
</article>

<div class='fcc container mx-auto h-full'
>
	<Social />
</div>
