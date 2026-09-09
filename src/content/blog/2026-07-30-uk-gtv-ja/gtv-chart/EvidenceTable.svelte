<script lang="ts">
	import type { ChartLang } from './copy.ts';
	import { localisePoint, resolveChartLang, uiCopy } from './copy.ts';
	import { segments } from './evidence-links.ts';
	import { rows } from './rows.ts';

	type Props = {
		/** Index of the focused row, or null when nothing is focused. */
		focused: number | null;
		/** Reports focus moving to a row, or clearing with null. */
		onFocusedChange: (focused: number | null) => void;
		lang?: ChartLang;
	};

	let { focused, onFocusedChange, lang: requestedLang }: Props = $props();
	const lang = $derived(resolveChartLang(requestedLang));
	const copy = $derived(uiCopy[lang].table);
	const percent = (value: number | null) => (value == null ? '—' : `${value}%`);
	const starLabel = (value: number | null) =>
		value == null ? '—' : value === 0 ? copy.almostZero : `~${value}K`;

	function scrollHorizontally(event: KeyboardEvent & { currentTarget: HTMLDivElement }) {
		const direction = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
		const element = event.currentTarget;
		if (direction === 0 || element.scrollWidth <= element.clientWidth) return;
		event.preventDefault();
		element.scrollLeft += direction * 80;
	}
</script>

<!-- Horizontal overflow must be keyboard-scrollable, hence the tabindex. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
<div
	aria-label={copy.regionLabel}
	class="scroll"
	onkeydown={scrollHorizontally}
	role="region"
	tabindex="0"
>
	<span aria-hidden="true" class="table-scroll-hint">← scroll →</span>
	<table>
		<caption class="sr-only">{copy.caption}</caption>
		<thead>
			<tr>
				<th scope="col">{copy.date}</th>
				<th class="num" scope="col">{copy.low}</th>
				<th class="num" scope="col">{copy.mid}</th>
				<th class="num" scope="col">{copy.high}</th>
				<th class="num" scope="col">{copy.stars}</th>
				<th scope="col">{copy.notes}</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row, index}
				{@const localised = localisePoint(row, lang)}
				<tr
					class:focused={focused === index}
					data-testid="gtv-row"
					onfocusin={() => onFocusedChange(index)}
					onfocusout={() => onFocusedChange(null)}
					onmouseenter={() => onFocusedChange(index)}
					onmouseleave={() => onFocusedChange(null)}
				>
					<th scope="row">
						{localised.label}{copy.headingOpen}
						{#if localised.milestoneHref}
							<a href={localised.milestoneHref} rel="noopener noreferrer" target="_blank"
								>{localised.milestone}</a
							>
						{:else}
							{localised.milestone}
						{/if}
						{copy.headingClose}
					</th>
					<td class="num">{percent(localised.low)}</td>
					<td class="num">{localised.mid == null ? copy.frozen : `${localised.mid}%`}</td>
					<td class="num">{percent(localised.high)}</td>
					<td class="num">{starLabel(localised.stars)}</td>
					<td>
						{#each segments(localised) as part}
							{#if part.href == null}
								{part.text}
							{:else}
								<a
									href={part.href}
									rel={part.href.startsWith('http') ? 'noopener noreferrer' : undefined}
									target={part.href.startsWith('http') ? '_blank' : undefined}>{part.text}</a
								>
							{/if}
						{/each}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
