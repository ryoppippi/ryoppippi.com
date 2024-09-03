<script>
	import * as ufo from 'ufo';
	import { formatDate } from '$lib/util.js';

	const { data } = $props();
</script>

<div class='mx-6'>
	{#each data.posts as item (item.title)}
		{@const external = 'link' in item && item.link.startsWith('http')}
		{@const pubDate = new Date(item.pubDate)}
		{@const href = 'link' in item ? item.link : ufo.joinURL('/blog', item.slug)}
		<p
			opacity-70
			text-text-200
		>
			{formatDate(pubDate)}
		</p>
		<a
			border='b-2 transparent hover:primary-100'
			flex
			{href}
			mr-5
			overflow-hidden='md:~'
			target={external ? '_blank' : ''}
			text-text-100
		>
			<p md-truncate>{item.title}</p>
			{#if external}
				<!-- svelte-ignore element_invalid_self_closing_tag -->
				<div
					hidden
					i-quill-link-out
					md-inline
					my-auto
				/>
			{/if}
		</a>
	{/each}
</div>
