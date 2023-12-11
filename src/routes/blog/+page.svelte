<script>
	export let data;

	import IconLinkOut from '~icons/quill/link-out';
	import { formatDate } from '$lib/util.js';
</script>

<div class="mx-6">
	{#each data.posts as item (item.title)}
		{@const external = 'link' in item && item.link.startsWith('http')}
		{@const pubDate = new Date(item.pubDate)}
		{@const href = 'link' in item ? item.link : `/blog/${item?.slug}`}
		<p class="text-me-text-200 opacity-70">{formatDate(pubDate)}</p>
		<a
			{href}
			target={external ? '_blank' : ''}
			class="mr-5 flex border-b-2 border-transparent text-me-text-100 hover:border-me-primary-100 md:overflow-hidden">
			<p class="md:truncate">{item.title}</p>
			{#if external}
				<IconLinkOut class="my-auto hidden md:inline" />
			{/if}
		</a>
	{/each}
</div>
