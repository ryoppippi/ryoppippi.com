import type { BlogPost } from '@/content/index.ts';
import { SITE_COPYRIGHT, SITE_ORIGIN } from '@/site/consts.ts';
import { loadDefaultJapaneseParser } from 'budoux';
import styles from './Article.module.css';

const budoux = loadDefaultJapaneseParser();

type ArticleProps = {
	date: string;
	pathname: string;
	post: BlogPost;
};

/**
 * Renders a blog article and its sharing links.
 *
 * @param props - Rendered post data and its canonical pathname.
 * @returns The article body fragment.
 */
export default function Article({ date, pathname, post }: ArticleProps) {
	const markdownPath = `${pathname.slice(0, -1)}.md`;
	const title = budoux.parse(post.title).join('\u200B');
	const url = `${SITE_ORIGIN}${pathname}`;
	const blueskyUrl = `https://bsky.app/intent/compose?text=${encodeURIComponent(`Reading @ryoppippi.com's ${url}\n\nI think...`)}`;
	const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Reading @ryoppippi's ${url}\n\nI think...`)}`;

	return (
		<>
			<link href={markdownPath} rel="alternate" title="Markdown source" type="text/plain" />
			<div class={styles.articlePage}>
				{!post.isPublished && (
					<p class={styles.articleUnpublished}>This article is not published yet.</p>
				)}

				<hgroup class={styles.articleHeading}>
					<h1 class={styles.articleTitle} style={`view-transition-name:blog-${post.filename}`}>
						{title}
					</h1>
					<p class={styles.articleMeta}>
						{date} ・ {post.readingTime.text} ・{' '}
						<a
							class={styles.articleSourceLink}
							aria-label="Markdown source"
							href={markdownPath}
							rel="noopener noreferrer"
							target="_blank"
						>
							<span
								class={`icon-[ri--markdown-line] ${styles.articleSourceIcon}`}
								aria-hidden="true"
							/>
						</a>
					</p>
				</hgroup>

				<div class={styles.articleDivider}>
					<hr />
				</div>

				<article
					class={`content ${styles.articleContent} ${styles.articleBody} prose`}
					innerHTML={post.html}
				/>

				<div class={styles.articleFooterBlock}>
					<span class={styles.articleFooterLabel}>comment on</span>{' '}
					<a href={blueskyUrl} rel="noopener noreferrer" target="_blank">
						bluesky
					</a>
					<span class={styles.articleFooterSeparator}> / </span>
					<a href={tweetUrl} rel="noopener noreferrer" target="_blank">
						twitter
					</a>
				</div>

				<div class={styles.articleFooterBlock}>
					<a
						href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
						rel="noopener noreferrer"
						target="_blank"
					>
						{SITE_COPYRIGHT}
					</a>
				</div>
			</div>
		</>
	);
}
