<script lang='ts'>
	import type { PostListItem } from '../content.ts';
	import { formatDate } from '../../lib/util.ts';

	let { items }: { items: PostListItem[] } = $props();
</script>

<h1 class='sr-only'>Blog</h1>

<div class='fcol mx-auto gap-1 px-10 pt-10'>
	<button class='fyc gap-1 text-sm opacity-30' aria-pressed='false' data-filter='english' type='button'>
		<span class='icon-[carbon--checkbox]' aria-hidden='true'></span>
		English Only
	</button>
	<button class='fyc gap-1 text-sm opacity-30' aria-pressed='false' data-filter='local' type='button'>
		<span class='icon-[carbon--checkbox]' aria-hidden='true'></span>
		ryoppippi.com exclusive
	</button>
</div>

<div class='mx-auto px-10'>
	{#each items as item (item.slug)}
		<div class='blog-item my-2' data-lang={item.lang} data-origin={item.external ? 'external' : 'local'}>
			<a
				class='group fyc mr-5 gap-3 op-card transition-base hover:no-underline'
				href={item.link}
				rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
				target={item.link.startsWith('http') ? '_blank' : undefined}
			>
				<div class='my-2 flex items-start gap-2'>
					<span class='mt-0.5'>
						<span
							class={`${item.external ? 'icon-[quill--link-out]' : 'icon-[simple-icons--markdown]'} blog-list-icon`}
							aria-hidden='true'
						></span>
					</span>
					<p class='gap-x-2' style={`view-transition-name:blog-${item.slug}`}>
						{#if item.draft === true}
							<span class='rounded bg-red-500 px-1 text-sm font-bold text-white'>(draft)</span>
						{/if}
						{item.title}
						<span class='truncate pl-2 text-sm opacity-50'>{formatDate(new Date(item.pubDate))}</span>
					</p>
				</div>
			</a>
		</div>
	{/each}
</div>
