<script>
	export let data;

	import IconLinkOut from '~icons/quill/link-out';
	import { format } from 'date-fns';
</script>

<div class="mx-5 grid place-items-start">
	{#each data.rss as item (item.link)}
		{@const external = item.link.startsWith('http')}
		{@const pubDate = new Date(item.pubDate)}
		<p class="flex">
			{format(pubDate, 'dd MMM Y: ')}
			<a
				href={item.link}
				target={external ? '_blank' : ''}
				class="border-b-2 border-transparent hover:border-me-primary-100">
				{item.title}
				{#if external}
					<IconLinkOut class="inline" />
				{/if}
			</a>
		</p>
	{/each}
</div>
