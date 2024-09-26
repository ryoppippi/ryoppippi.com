<script>
	import * as ufo from 'ufo';
	import Title from '$lib/Title.svelte';
	import { formatDate } from '$lib/util';

	const { data } = $props();
</script>

<Title title='blog' />

<div mxa px-10>
	{#each data.posts as item, count (item.title)}
		{@const external = 'link' in item && item.link.startsWith('http')}
		{@const pubDate = new Date(item.pubDate)}
		{@const href = 'link' in item ? item.link : ufo.joinURL('/blog', item.slug)}
		<div
			style:--stagger={count}
			class='[--delay:80ms] sm:[--delay:150ms]'
			data-sliding-animate
			my-2
		>
			<p opacity-70>
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
				target={external ? '_blank' : ''}
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
				<p truncate>{item.title}</p>
			</a>
		</div>
	{/each}
</div>

<style>
a {
	--at-apply: hover:no-underline;
}
</style>
