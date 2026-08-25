<script lang='ts'>
	import type { PostListItem } from '../content.ts';
	import { formatDate } from '../../lib/util.ts';
	import WorksNav from './WorksNav.svelte';

	let { items }: { items: PostListItem[] } = $props();
	const groups = [
		{ kind: 'podcast', label: 'Podcasts', icon: 'icon-[ri--mic-line]' },
		{ kind: 'video', label: 'YouTube', icon: 'icon-[ri--youtube-line]' },
	] as const;
	const groupedItems = $derived(
		groups
			.map((group) => ({
				...group,
				items: items.filter((item) => item.kind === group.kind),
			}))
			.filter((group) => group.items.length > 0),
	);
</script>

<WorksNav active='media' />

<div class='fcol mx-auto gap-1 pt-10'>
	<p class='mx-10 text-center text-lg opacity-30'>Podcasts, interviews, and videos featuring @ryoppippi.</p>
</div>

{#each groupedItems as group (group.kind)}
	<section data-media-kind={group.kind}>
		<h2 class='f-text-32-64 my-8 font-mono font-bold leading-none text-stroke-aaa text-transparent opacity-35 dark:opacity-20'>{group.label}</h2>
		<ul class='mx-auto px-10'>
			{#each group.items as item (item.slug)}
				<li class='my-5'>
					<a class='group fyc gap-3 op-card transition-base hover:no-underline' href={item.link} rel='noopener noreferrer' target='_blank'>
						<span class={`${group.icon} shrink-0`} aria-hidden='true'></span>
						<span class='min-w-0'>
							<span class='block text-xl'>{item.title}</span>
							<time class='text-sm opacity-50' datetime={item.pubDate}>{formatDate(new Date(item.pubDate))}</time>
						</span>
					</a>
				</li>
			{/each}
		</ul>
	</section>
{/each}
