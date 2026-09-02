import type { Talk } from '../../../sections.ts';
import { formatDate } from '../../../../lib/util.ts';
import WorksNav from '../_components/WorksNav/index.tsx';
import WorksSection, { WorksList } from '../_components/WorksSection/index.tsx';
import styles from './Talks.module.css';

type TalksProps = {
	talks: Talk[];
};

/**
 * Renders talks grouped by year.
 *
 * @param props - Talks to group and display.
 * @returns The talks page fragment.
 */
export default function Talks({ talks }: TalksProps) {
	const byYear = [
		...Map.groupBy(talks, (talk) => new Date(talk.date).getFullYear()).entries(),
	].sort(([a], [b]) => b - a);

	return (
		<>
			<WorksNav active="talks" />
			<div class={styles.talksControls}>
				<a
					class={styles.talksControlLink}
					href="https://talks.ryoppippi.com/feed.xml"
					rel="noopener noreferrer"
					target="_blank"
				>
					<span class="icon-[line-md--rss]" aria-hidden="true" />
					Feed
				</a>
				<a
					class={styles.talksControlLink}
					href="/yt-talks"
					rel="noopener noreferrer"
					target="_blank"
				>
					<span class="icon-[ri--youtube-line]" aria-hidden="true" />
					Watch all talks on YouTube
				</a>
				<button
					class={styles.talksFilter}
					aria-pressed="false"
					data-talk-filter="english"
					type="button"
				>
					<span class="icon-[carbon--checkbox]" aria-hidden="true" />
					English Only
				</button>
			</div>

			{byYear.map(([year, items]) => (
				<WorksSection title={year} filter="talk">
					<WorksList>
						{items.map((talk) => {
							const link = talk.links.at(0);
							const event = talk.event === 'テックワールド' ? 'TECH WORLD' : talk.event;
							return (
								<li class={styles.talkItem} data-talk-item data-lang={talk.lang ?? 'en'}>
									<h3 class={styles.talkTitle}>
										{link == null ? (
											talk.title
										) : (
											<a
												class={styles.talkLink}
												href={link}
												rel="noopener noreferrer"
												target="_blank"
											>
												{talk.title}
											</a>
										)}
									</h3>
									<p class={styles.talkMeta}>
										{talk.eventLink == null ? (
											event
										) : (
											<a
												class={styles.talkLink}
												href={talk.eventLink}
												rel="noopener noreferrer"
												target="_blank"
											>
												{event}
											</a>
										)}
										<time class={styles.talkDate} datetime={talk.date}>
											{formatDate(new Date(talk.date))}
										</time>
									</p>
									{talk.videoLink != null && (
										<p class={styles.talkVideo}>
											<a
												class={styles.talkLink}
												href={talk.videoLink}
												rel="noopener noreferrer"
												target="_blank"
											>
												Watch the video
											</a>
										</p>
									)}
								</li>
							);
						})}
					</WorksList>
				</WorksSection>
			))}
		</>
	);
}
