import { formatDate } from '@/lib/util.ts';
import type { PostListItem } from '@/contents/external-content.ts';
import WorksNav from '@/pages/works/_components/WorksNav';
import WorksSection, { WorksList } from '@/pages/works/_components/WorksSection';
import styles from './Media.module.css';

type MediaPageProps = {
	items: PostListItem[];
};

const kindDetails = {
	article: { label: 'Article', icon: 'icon-[quill--link-out]' },
	podcast: { label: 'Podcast', icon: 'icon-[ri--mic-line]' },
	video: { label: 'YouTube', icon: 'icon-[ri--youtube-line]' },
} as const;

/**
 * Renders media appearances grouped by year.
 *
 * @param props - Curated media entries to display.
 * @returns The media page fragment.
 */
export default function MediaPage({ items }: MediaPageProps) {
	const playlist = items.find((item) => item.playlist === true);
	const mediaItems = items.filter((item) => item.playlist !== true);
	const byYear = [
		...Map.groupBy(mediaItems, (item) => new Date(item.pubDate).getFullYear()).entries(),
	].sort(([a], [b]) => b - a);

	return (
		<>
			<WorksNav active="media" />
			<div class={styles.mediaControls}>
				<a
					class={styles.mediaControlLink}
					href="/works/media/feed.xml"
					rel="alternate"
					target="_blank"
					type="application/rss+xml"
				>
					<span class="icon-[line-md--rss]" aria-hidden="true" />
					Feed
				</a>
				{playlist != null && (
					<a
						class={styles.mediaControlLink}
						href={playlist.link}
						rel="noopener noreferrer"
						target="_blank"
					>
						<span class="icon-[ri--youtube-line]" aria-hidden="true" />
						Watch all videos on YouTube
					</a>
				)}
				<button
					class={styles.mediaFilter}
					aria-pressed="false"
					data-media-filter="english"
					type="button"
				>
					<span class="icon-[carbon--checkbox]" aria-hidden="true" />
					English Only
				</button>
			</div>

			{byYear.map(([year, yearItems]) => (
				<WorksSection title={year} filter="media">
					<WorksList>
						{yearItems.map((item) => {
							const details = kindDetails[item.kind ?? 'podcast'];
							return (
								<li class={styles.mediaItem} data-media-item data-lang={item.lang ?? 'ja'}>
									<h3 class={styles.mediaTitle}>
										<a
											class={styles.mediaLink}
											href={item.link}
											rel="noopener noreferrer"
											target="_blank"
										>
											{item.title}
										</a>
									</h3>
									<p class={styles.mediaMeta}>
										<span class={`${details.icon} ${styles.mediaKindIcon}`} aria-hidden="true" />
										{details.label}
										<time class={styles.mediaDate} datetime={item.pubDate}>
											{formatDate(new Date(item.pubDate))}
										</time>
									</p>
								</li>
							);
						})}
					</WorksList>
				</WorksSection>
			))}
		</>
	);
}
