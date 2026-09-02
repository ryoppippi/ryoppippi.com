import type { Talk } from '../../pages/works/talks/index.ts';
import { formatDate } from '../../lib/util.ts';
import WorksNav from './WorksNav.tsx';

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
			<div class="fcol mx-auto gap-1 pt-10">
				<a
					class="fyc my-auto gap-1 opacity-30"
					href="https://talks.ryoppippi.com/feed.xml"
					rel="noopener noreferrer"
					target="_blank"
				>
					<span class="icon-[line-md--rss]" aria-hidden="true" />
					Feed
				</a>
				<a
					class="fyc my-auto gap-1 opacity-30"
					href="/yt-talks"
					rel="noopener noreferrer"
					target="_blank"
				>
					<span class="icon-[ri--youtube-line]" aria-hidden="true" />
					Watch all talks on YouTube
				</a>
				<button
					class="fyc gap-1 text-sm opacity-30"
					aria-pressed="false"
					data-talk-filter="english"
					type="button"
				>
					<span class="icon-[carbon--checkbox]" aria-hidden="true" />
					English Only
				</button>
			</div>

			{byYear.map(([year, items]) => (
				<section data-talk-year>
					<h2 class="f-text-32-64 my-8 font-mono font-bold leading-none text-stroke-aaa text-transparent opacity-35 dark:opacity-20">
						{year}
					</h2>
					<ul class="mx-auto px-10">
						{items.map((talk) => {
							const link = talk.links.at(0);
							const event = talk.event === 'テックワールド' ? 'TECH WORLD' : talk.event;
							return (
								<li class="talk-item my-5" data-lang={talk.lang ?? 'en'}>
									<h3 class="op-card text-xl transition-base">
										{link == null ? (
											talk.title
										) : (
											<a class="underline" href={link} rel="noopener noreferrer" target="_blank">
												{talk.title}
											</a>
										)}
									</h3>
									<p class="opacity-50">
										{talk.eventLink == null ? (
											event
										) : (
											<a
												class="underline"
												href={talk.eventLink}
												rel="noopener noreferrer"
												target="_blank"
											>
												{event}
											</a>
										)}
										<time class="truncate pl-2 text-sm opacity-80" datetime={talk.date}>
											{formatDate(new Date(talk.date))}
										</time>
									</p>
									{talk.videoLink != null && (
										<p class="text-sm opacity-50">
											<a
												class="underline"
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
					</ul>
				</section>
			))}
		</>
	);
}
