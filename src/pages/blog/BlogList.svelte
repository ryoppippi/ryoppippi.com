<script lang="ts">
	import { formatDate } from '@/lib/date.ts';

	import type { PostListItem } from '@/lib/post-list.ts';

	type BlogListProps = {
		items: PostListItem[];
	};

	const externalKindIcons = {
		article: 'icon-[quill--link-out]',
		podcast: 'icon-[ri--mic-line]',
		video: 'icon-[ri--youtube-line]',
	} as const;

	const externalKindLabels = {
		article: 'Article',
		podcast: 'Podcast',
		video: 'YouTube video',
	} as const;

	let { items }: BlogListProps = $props();
</script>

<h1 class="visuallyHidden">Blog</h1>
<div class="blogFilters">
	<button class="blogFilter" aria-pressed="false" data-filter="english" type="button"
		><span class="icon-[carbon--checkbox]" aria-hidden="true"></span>English Only</button
	><button class="blogFilter" aria-pressed="false" data-filter="local" type="button"
		><span class="icon-[carbon--checkbox]" aria-hidden="true"></span>ryoppippi.com exclusive</button
	>
</div>
<span class="visuallyHidden" id="blog-filter-status" aria-atomic="true" aria-live="polite"
	>Showing all blog posts</span
>
<div class="blogList">
	{#each items as item}
		{@const kind = item.kind ?? 'article'}
		{@const external = item.external === true}
		<div
			class="blogItem"
			data-blog-item
			data-kind={kind}
			data-lang={item.lang}
			data-origin={external ? 'external' : 'local'}
		>
			<a
				class="blogEntry"
				href={item.link}
				rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
				target={item.link.startsWith('http') ? '_blank' : undefined}
				><div class="blogEntryContent">
					<span
						class={`${external ? externalKindIcons[kind] : 'icon-[simple-icons--markdown]'} blogEntryIcon`}
						title={external ? externalKindLabels[kind] : undefined}
						aria-hidden="true"
					></span>
					<p class="blogEntryTitle" style={`view-transition-name:blog-${item.slug}`}>
						{#if item.draft === true}<span class="blogEntryDraft">(draft)</span
							>{/if}{' '}{item.title}<span class="blogEntryDate"
							>{formatDate(new Date(item.pubDate))}</span
						>
					</p>
				</div></a
			>
		</div>
	{/each}
</div>

<style>
	.visuallyHidden {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}

	.blogFilters {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-inline: auto;
		padding: 2.5rem 2.5rem 0;
	}

	.blogFilter {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.875rem;
		opacity: 0.3;
	}

	.blogList {
		margin-inline: auto;
		padding-inline: 2.5rem;
	}

	.blogItem {
		margin-block: 0.5rem;
	}

	.blogEntry {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-right: 1.25rem;
		opacity: 0.7;
		text-decoration: none;
		transition:
			opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
			text-decoration-color 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.blogEntry:hover {
		opacity: 0.8;
		text-decoration: none;
	}

	.blogEntryContent {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-block: 0.5rem;
	}

	.blogEntryIcon {
		display: block;
		width: 1.25rem;
		height: 1.25rem;
		flex-shrink: 0;
	}

	.blogEntryDraft {
		border-radius: 0.25rem;
		background-color: #ef4444;
		padding-inline: 0.25rem;
		font-size: 0.875rem;
		font-weight: 700;
		color: #ffffff;
	}

	.blogEntryDate {
		display: inline-block;
		vertical-align: middle;
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		padding-left: 0.5rem;
		font-size: 0.875rem;
		opacity: 0.5;
	}
</style>
