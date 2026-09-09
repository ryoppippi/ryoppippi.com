<script lang="ts">
	import type { BlogPost } from '@/pages/blog/data.ts';

	import { SITE_COPYRIGHT, SITE_ORIGIN } from '@/config/site.ts';

	import { loadDefaultJapaneseParser } from 'budoux';

	import './ArticleContent.css';

	const budoux = loadDefaultJapaneseParser();

	type ArticleProps = {
		date: string;
		pathname: string;
		post: BlogPost;
	};

	let { date, pathname, post }: ArticleProps = $props();

	const markdownPath = $derived(`${pathname.slice(0, -1)}.md`);

	const title = $derived(budoux.parse(post.title).join('\u200B'));

	const url = $derived(`${SITE_ORIGIN}${pathname}`);

	const blueskyUrl = $derived(
		`https://bsky.app/intent/compose?text=${encodeURIComponent(`Reading @ryoppippi.com's ${url}\n\nI think...`)}`,
	);

	const tweetUrl = $derived(
		`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Reading @ryoppippi's ${url}\n\nI think...`)}`,
	);
</script>

<div class="articlePage">
	{#if !post.isPublished}
		<p class="articleUnpublished">This article is not published yet.</p>
	{/if}
	<hgroup class="articleHeading">
		<h1 class="articleTitle" style={`view-transition-name:blog-${post.filename}`}>{title}</h1>
		<p class="articleMeta">
			{date} ・
			{#if post.readingTime < 1}
				Under a minute
			{:else}
				{`${post.readingTime} min read`}
			{/if}
			・
			<a
				class="articleSourceLink"
				aria-label="Markdown source"
				href={markdownPath}
				rel="noopener noreferrer"
				target="_blank"
			>
				<span class={['icon-[ri--markdown-line]', 'articleSourceIcon']} aria-hidden="true"></span>
			</a>
		</p>
	</hgroup>
	<div class="articleDivider">
		<hr />
	</div>
	<article class={['content', 'articleContent', 'articleBody', 'prose']}>{@html post.html}</article>
	<div class="articleFooterBlock">
		<span class="articleFooterLabel">comment on</span>
		<a href={blueskyUrl} rel="noopener noreferrer" target="_blank">bluesky</a>
		<span class="articleFooterSeparator">/</span>
		<a href={tweetUrl} rel="noopener noreferrer" target="_blank">twitter</a>
	</div>
	<div class="articleFooterBlock">
		<a
			href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
			rel="noopener noreferrer"
			target="_blank"
		>
			{SITE_COPYRIGHT}
		</a>
	</div>
</div>

<style>
	.articlePage {
		min-width: 0;
		margin-inline: auto;
	}

	.articleUnpublished {
		margin-top: 1rem;
		border-radius: 0.25rem;
		background-color: #ef4444;
		padding: 0.5rem;
		text-align: center;
		font-size: 1.25rem;
		line-height: 1.75rem;
		font-weight: 700;
		color: #ffffff;
	}

	.articleHeading {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		margin-bottom: 0.75rem;
		text-align: center;
	}

	.articleTitle {
		margin-block: 2rem;
		font-family: var(--font-mono);
		font-size: clamp(2rem, 1.2958rem + 3.0047vw, 4rem);
		line-height: 1;
		font-weight: 700;
		color: transparent;
		-webkit-text-stroke: 1.5px #aaaaaa;
		word-break: keep-all;
		overflow-wrap: anywhere;
	}

	.articleMeta {
		color: var(--color-text-400);
	}

	.articleSourceLink {
		opacity: 0.7;
	}

	.articleSourceLink:hover {
		opacity: 1;
	}

	.articleSourceIcon {
		display: inline-block;
		width: 1.5rem;
		height: 1.5rem;
		vertical-align: middle;
	}

	.articleDivider {
		padding: 0.5rem;
	}

	.articleDivider hr {
		width: 100%;
		max-width: 25rem;
		margin-inline: auto;
		opacity: 0.25;
	}

	.articleBody {
		max-width: none;
		padding-bottom: 2rem;
	}

	.articleContent {
		--octc-color-bg: transparent;
		--octc-color-bg-alt: #8881;
		--octc-color-border: #8884;
		--octc-color-primary: currentcolor;
		--octc-color-text: currentcolor;
		--octc-color-text-muted: #808080;
		--octc-focus-offset: 2px;
		--octc-focus-ring: 2px solid currentcolor;
		word-break: keep-all;
		overflow-wrap: anywhere;
	}

	.articleFooterBlock {
		padding-bottom: 2rem;
		opacity: 0.5;
	}

	.articleFooterLabel {
		opacity: 0.7;
	}

	.articleFooterSeparator {
		opacity: 0.35;
	}
</style>
