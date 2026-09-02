import type { PostListItem } from '../../pages/blog/index.ts';
import { formatDate } from '../../lib/util.ts';

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

/**
 * Renders the filterable blog index.
 *
 * @param props - Local and external posts to display.
 * @returns The blog list fragment.
 */
export default function BlogList({ items }: BlogListProps) {
	return (
		<>
			<h1 class="sr-only">Blog</h1>
			<div class="fcol mx-auto gap-1 px-10 pt-10">
				<button
					class="fyc gap-1 text-sm opacity-30"
					aria-pressed="false"
					data-filter="english"
					type="button"
				>
					<span class="icon-[carbon--checkbox]" aria-hidden="true" />
					English Only
				</button>
				<button
					class="fyc gap-1 text-sm opacity-30"
					aria-pressed="false"
					data-filter="local"
					type="button"
				>
					<span class="icon-[carbon--checkbox]" aria-hidden="true" />
					ryoppippi.com exclusive
				</button>
			</div>

			<div class="mx-auto px-10">
				{items.map((item) => {
					const kind = item.kind ?? 'article';
					const external = item.external === true;
					return (
						<div
							class="blog-item my-2"
							data-kind={kind}
							data-lang={item.lang}
							data-origin={external ? 'external' : 'local'}
						>
							<a
								class="group fyc mr-5 gap-3 op-card transition-base hover:no-underline"
								href={item.link}
								rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
								target={item.link.startsWith('http') ? '_blank' : undefined}
							>
								<div class="my-2 flex items-start gap-2">
									<span class="mt-0.5">
										<span
											class={`${external ? externalKindIcons[kind] : 'icon-[simple-icons--markdown]'} blog-list-icon`}
											title={external ? externalKindLabels[kind] : undefined}
											aria-hidden="true"
										/>
									</span>
									<p class="gap-x-2" style={`view-transition-name:blog-${item.slug}`}>
										{item.draft === true && (
											<span class="rounded bg-red-500 px-1 text-sm font-bold text-white">
												(draft)
											</span>
										)}{' '}
										{item.title}
										<span class="truncate pl-2 text-sm opacity-50">
											{formatDate(new Date(item.pubDate))}
										</span>
									</p>
								</div>
							</a>
						</div>
					);
				})}
			</div>
		</>
	);
}
