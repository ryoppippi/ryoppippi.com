import type { ChartLang } from './copy.ts';
import { For, Show } from 'solid-js';
import { localisePoint, resolveChartLang, uiCopy } from './copy.ts';
import { segments } from './evidence-links.ts';
import { rows } from './rows.ts';

type EvidenceTableProps = {
	/** Index of the focused row, or null when nothing is focused. */
	focused: number | null;
	/** Reports focus moving to a row, or clearing with null. */
	onFocusedChange: (focused: number | null) => void;
	lang?: ChartLang;
};

/**
 * Evidence table under the chart, sharing its focus with the timeline.
 */
export default function EvidenceTable(props: EvidenceTableProps) {
	const lang = () => resolveChartLang(props.lang);
	const copy = () => uiCopy[lang()].table;

	const percent = (value: number | null) => (value == null ? '—' : `${value}%`);

	const starLabel = (value: number | null) =>
		value == null ? '—' : value === 0 ? copy().almostZero : `~${value}K`;

	function scrollHorizontally(event: KeyboardEvent & { currentTarget: HTMLDivElement }) {
		const direction = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
		const element = event.currentTarget;
		if (direction === 0 || element.scrollWidth <= element.clientWidth) {
			return;
		}

		event.preventDefault();
		element.scrollLeft += direction * 80;
	}

	// Horizontal overflow must be keyboard-scrollable, hence the tabindex.
	return (
		<div
			aria-label={copy().regionLabel}
			class='scroll'
			onKeyDown={scrollHorizontally}
			role='region'
			tabindex='0'
		>
			<span aria-hidden='true' class='table-scroll-hint'>
				← scroll →
			</span>
			<table>
				<caption class='sr-only'>{copy().caption}</caption>
				<thead>
					<tr>
						<th scope='col'>{copy().date}</th>
						<th class='num' scope='col'>
							{copy().low}
						</th>
						<th class='num' scope='col'>
							{copy().mid}
						</th>
						<th class='num' scope='col'>
							{copy().high}
						</th>
						<th class='num' scope='col'>
							{copy().stars}
						</th>
						<th scope='col'>{copy().notes}</th>
					</tr>
				</thead>
				<tbody>
					<For each={rows}>
						{(row, index) => {
							const localised = () => localisePoint(row, lang());
							return (
								<tr
									classList={{ focused: props.focused === index() }}
									data-testid='gtv-row'
									onFocusIn={() => props.onFocusedChange(index())}
									onFocusOut={() => props.onFocusedChange(null)}
									onMouseEnter={() => props.onFocusedChange(index())}
									onMouseLeave={() => props.onFocusedChange(null)}
								>
									<th scope='row'>
										{localised().label}
										{copy().headingOpen}
										<Show when={localised().milestoneHref} fallback={localised().milestone}>
											{(href) => (
												<a href={href()} rel='noopener noreferrer' target='_blank'>
													{localised().milestone}
												</a>
											)}
										</Show>
										{copy().headingClose}
									</th>
									<td class='num'>{percent(localised().low)}</td>
									<td class='num'>
										{localised().mid == null ? copy().frozen : `${localised().mid}%`}
									</td>
									<td class='num'>{percent(localised().high)}</td>
									<td class='num'>{starLabel(localised().stars)}</td>
									<td>
										<For each={segments(localised())}>
											{(part) => {
												if (part.href == null) {
													return part.text;
												}

												const external = part.href.startsWith('http');
												return (
													<a
														href={part.href}
														rel={external ? 'noopener noreferrer' : undefined}
														target={external ? '_blank' : undefined}
													>
														{part.text}
													</a>
												);
											}}
										</For>
									</td>
								</tr>
							);
						}}
					</For>
				</tbody>
			</table>
		</div>
	);
}
