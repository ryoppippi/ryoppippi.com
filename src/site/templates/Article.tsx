import type { BlogPost } from '../../pages/blog/index.ts';
import { loadDefaultJapaneseParser } from 'budoux';
import { SITE_COPYRIGHT, SITE_ORIGIN } from '../consts.ts';

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
			<div class="mx-auto min-w-0">
				{!post.isPublished && (
					<p class="mt-4 rounded bg-red-500 p-2 text-center text-xl font-bold text-white">
						This article is not published yet.
					</p>
				)}

				<hgroup class="fcol fyc mb-3 gap-1 text-center">
					<h1
						class="f-text-32-64 my-8 break-keep wrap-anywhere font-mono font-bold leading-none text-stroke-aaa text-transparent"
						style={`view-transition-name:blog-${post.filename}`}
					>
						{title}
					</h1>
					<p class="text-text-400">
						{date} ・ {post.readingTime.text} ・{' '}
						<a
							class="opacity-70 hover:opacity-100"
							aria-label="Markdown source"
							href={markdownPath}
							rel="noopener noreferrer"
							target="_blank"
						>
							<span class="icon-[ri--markdown-line] size-6 align-middle" aria-hidden="true" />
						</a>
					</p>
				</hgroup>

				<div class="p-2">
					<hr class="m-auto w-full max-w-100 opacity-25" />
				</div>

				<article
					class="content prose mx-auto max-w-none pb-8 text-text-700 dark:prose-invert dark:text-text-200"
					innerHTML={post.html}
				/>

				<div class="pb-8 opacity-50">
					<span class="opacity-70">comment on</span>{' '}
					<a href={blueskyUrl} rel="noopener noreferrer" target="_blank">
						bluesky
					</a>
					<span class="opacity-35"> / </span>
					<a href={tweetUrl} rel="noopener noreferrer" target="_blank">
						twitter
					</a>
				</div>

				<div class="pb-8 opacity-50">
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
