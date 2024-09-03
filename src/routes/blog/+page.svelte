<script>
	import * as ufo from 'ufo';
	import { formatDate } from '$lib/util.js';

	const { data } = $props();
</script>

<div max-w-xl>
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
			class='group'
			border='b-2 transparent hover:primary-100'
			flex
			gap-3
			{href}
			items-center
			mr-5
			overflow-hidden='md:~'
			target={external ? '_blank' : ''}
			text-text-100
		>
			<!-- svelte-ignore element_invalid_self_closing_tag -->
			{#if external}
				{#if item.link.includes('zenn')}
					<span
						blog-list-icon
						i-simple-icons-zenn
						text='group-hover:[#3EA8FF]'
					/>
				{:else}
					<span blog-list-icon i-quill-link-out />
				{/if}
			{:else}
				<span blog-list-icon i-simple-icons-markdown />
			{/if}
			<p md-truncate>{item.title}</p>
		</a>
	{/each}
</div>
