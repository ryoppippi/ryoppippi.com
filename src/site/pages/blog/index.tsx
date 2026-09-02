import type { PostListItem } from '../../content.ts';
import { formatDate } from '../../../lib/util.ts';
import styles from './BlogList.module.css';

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
			<h1 class={styles.visuallyHidden}>Blog</h1>
			<div class={styles.blogFilters}>
				<button class={styles.blogFilter} aria-pressed="false" data-filter="english" type="button">
					<span class="icon-[carbon--checkbox]" aria-hidden="true" />
					English Only
				</button>
				<button class={styles.blogFilter} aria-pressed="false" data-filter="local" type="button">
					<span class="icon-[carbon--checkbox]" aria-hidden="true" />
					ryoppippi.com exclusive
				</button>
			</div>

			<div class={styles.blogList}>
				{items.map((item) => {
					const kind = item.kind ?? 'article';
					const external = item.external === true;
					return (
						<div
							class={styles.blogItem}
							data-blog-item
							data-kind={kind}
							data-lang={item.lang}
							data-origin={external ? 'external' : 'local'}
						>
							<a
								class={styles.blogEntry}
								href={item.link}
								rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
								target={item.link.startsWith('http') ? '_blank' : undefined}
							>
								<div class={styles.blogEntryContent}>
									<span class={styles.blogEntryIconFrame}>
										<span
											class={`${external ? externalKindIcons[kind] : 'icon-[simple-icons--markdown]'} ${styles.blogEntryIcon}`}
											title={external ? externalKindLabels[kind] : undefined}
											aria-hidden="true"
										/>
									</span>
									<p class={styles.blogEntryTitle} style={`view-transition-name:blog-${item.slug}`}>
										{item.draft === true && <span class={styles.blogEntryDraft}>(draft)</span>}{' '}
										{item.title}
										<span class={styles.blogEntryDate}>{formatDate(new Date(item.pubDate))}</span>
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
