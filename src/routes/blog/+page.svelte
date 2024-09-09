<script>
	import * as ufo from 'ufo';
	import { formatDate } from '$lib/util.js';

	const { data } = $props();
</script>

<div mxa px-2>
	{#each data.posts as item, count (item.title)}
		{@const external = 'link' in item && item.link.startsWith('http')}
		{@const pubDate = new Date(item.pubDate)}
		{@const href = 'link' in item ? item.link : ufo.joinURL('/blog', item.slug)}
		<div
			style:--stagger={count}
			style:--depaly='150ms'
			data-animate
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

@keyframes enter {
0% {
	opacity: 0;
	transform: translateY(10px);
}

to {
	opacity: 1;
	transform: none;
}
}

[data-animate] {
	--stagger: 0;
	--delay: 80ms;
	--start: 0ms;
}

[data-animate] {
	opacity: 0;
	animation: enter 0.6s both;
	animation-iteration-count: 1;
	animation-delay: calc(var(--stagger) * var(--delay) + var(--start));
}

@media (prefers-reduced-motion: reduce) {
	[data-animate] {
		animation: none;
	}
}
</style>
