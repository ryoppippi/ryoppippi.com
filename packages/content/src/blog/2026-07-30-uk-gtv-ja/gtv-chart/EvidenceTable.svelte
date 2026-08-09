<script lang='ts'>
	import { segments } from './evidence-links.ts';
	import { rows } from './rows.ts';

	let { focused = $bindable() }: { focused: number | null } = $props();

	const percent = (value: number | null) => (value == null ? '—' : `${value}%`);

	const starLabel = (value: number | null) =>
		value == null ? '—' : value === 0 ? 'ほぼ0' : `~${value}K`;

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
	aria-label='グラフの数値データ'
	class='scroll'
	onkeydown={scrollHorizontally}
	role='region'
	tabindex='0'
>
	<span aria-hidden='true' class='table-scroll-hint'>← scroll →</span>
	<table>
		<caption class='sr-only'>申請時点ごとの通過見込みとccusageのstar数</caption>
		<thead>
			<tr>
				<th scope='col'>時点（年/月）</th>
				<th class='num' scope='col'>低め</th>
				<th class='num' scope='col'>中央</th>
				<th class='num' scope='col'>高め</th>
				<th class='num' scope='col'>ccusage stars</th>
				<th scope='col'>備考</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row, index (row.date)}
				<tr
					class:focused={focused === index}
					data-testid='gtv-row'
					onfocusin={() => (focused = index)}
					onfocusout={() => (focused = null)}
					onmouseenter={() => (focused = index)}
					onmouseleave={() => (focused = null)}
				>
					<th scope='row'>
						{row.label}（{#if row.milestoneHref == null}{row.milestone}{:else}<a
								href={row.milestoneHref}
								rel='noopener noreferrer'
								target='_blank'>{row.milestone}</a>{/if}）
					</th>
					<td class='num'>{percent(row.low)}</td>
					<td class='num'>{row.mid == null ? '凍結' : `${row.mid}%`}</td>
					<td class='num'>{percent(row.high)}</td>
					<td class='num'>{starLabel(row.stars)}</td>
					<td>
						{#each segments(row) as part (part.text)}
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
