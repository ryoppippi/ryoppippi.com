<script lang='ts'>
	import { localisePoint, resolveChartLang, uiCopy, type ChartLang } from './copy.ts';
	import { segments } from './evidence-links.ts';
	import { rows } from './rows.ts';

	let { focused = $bindable(), lang = 'ja' }: { focused: number | null; lang?: ChartLang } =
		$props();

	const resolvedLang = $derived(resolveChartLang(lang));
	const copy = $derived(uiCopy[resolvedLang].table);

	const percent = (value: number | null) => (value == null ? '—' : `${value}%`);

	const starLabel = (value: number | null) =>
		value == null ? '—' : value === 0 ? copy.almostZero : `~${value}K`;

	function scrollHorizontally(event: KeyboardEvent) {
		const direction = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
		const element = event.currentTarget as HTMLDivElement;
		if (direction === 0 || element.scrollWidth <= element.clientWidth) {
			return;
		}

		event.preventDefault();
		element.scrollLeft += direction * 80;
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions (horizontal overflow must be keyboard-scrollable) -->
<div
	aria-label={copy.regionLabel}
	class='scroll'
	onkeydown={scrollHorizontally}
	role='region'
	tabindex='0'
>
	<span aria-hidden='true' class='table-scroll-hint'>← scroll →</span>
	<table>
		<caption class='sr-only'>{copy.caption}</caption>
		<thead>
			<tr>
				<th scope='col'>{copy.date}</th>
				<th class='num' scope='col'>{copy.low}</th>
				<th class='num' scope='col'>{copy.mid}</th>
				<th class='num' scope='col'>{copy.high}</th>
				<th class='num' scope='col'>{copy.stars}</th>
				<th scope='col'>{copy.notes}</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row, index (row.date)}
				{@const localised = localisePoint(row, resolvedLang)}
				<tr
					class:focused={focused === index}
					data-testid='gtv-row'
					onfocusin={() => (focused = index)}
					onfocusout={() => (focused = null)}
					onmouseenter={() => (focused = index)}
					onmouseleave={() => (focused = null)}
				>
					<th scope='row'>
						{localised.label}{copy.headingOpen}{#if localised.milestoneHref == null}{localised.milestone}{:else}<a
								href={localised.milestoneHref}
								rel='noopener noreferrer'
								target='_blank'>{localised.milestone}</a>{/if}{copy.headingClose}
					</th>
					<td class='num'>{percent(localised.low)}</td>
					<td class='num'>{localised.mid == null ? copy.frozen : `${localised.mid}%`}</td>
					<td class='num'>{percent(localised.high)}</td>
					<td class='num'>{starLabel(localised.stars)}</td>
					<td>
						{#each segments(localised) as part (part.text)}
							{#if part.href == null}
								{part.text}
							{:else if part.href.startsWith('http')}
								<a href={part.href} rel='noopener noreferrer' target='_blank'>{part.text}</a>
							{:else}
								<a href={part.href}>{part.text}</a>
							{/if}
						{/each}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	/* spellchecker:off */
	.scroll {
		overflow-x: auto;
		margin-top: 1.5rem;
	}

	.scroll:focus-visible {
		outline: 2px solid var(--gtv-mid);
		outline-offset: 2px;
	}

	table {
		width: 100%;
		min-width: 52rem;
		border-collapse: collapse;
		font-size: 0.8125rem;
	}

	th,
	td {
		padding: 0.5rem 0.75rem;
		text-align: left;
		vertical-align: top;
		border-bottom: 1px solid var(--gtv-edge);
		overflow-wrap: normal;
	}

	thead th {
		font-weight: 600;
		white-space: nowrap;
	}

	tbody th {
		font-weight: 400;
		white-space: nowrap;
	}

	th:last-child,
	td:last-child {
		min-width: 20rem;
	}

	.num {
		text-align: right;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	tbody tr.focused {
		opacity: 1;
		background-color: color-mix(in oklab, var(--gtv-mid) 12%, transparent);
	}
	/* spellchecker:on */
</style>
