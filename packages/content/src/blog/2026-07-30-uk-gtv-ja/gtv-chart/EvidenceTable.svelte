<script lang='ts'>
	import { segments } from './evidence-links.ts';
	import { rows } from './rows.ts';

	let { focused = $bindable() }: { focused: number | null } = $props();

	const percent = (value: number | null) => (value == null ? '—' : `${value}%`);

	const starLabel = (value: number | null) =>
		value == null ? '—' : value === 0 ? 'ほぼ0' : `~${value}K`;

</script>

<div class='scroll'>
	<table class:focusing={focused != null}>
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
					onmouseenter={() => (focused = index)}
					onmouseleave={() => (focused = null)}
				>
					<th scope='row' tabindex='0'>
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

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.8125rem;
	}

	th,
	td {
		padding: 0.5rem 0.75rem;
		text-align: left;
		vertical-align: top;
		border-bottom: 1px solid var(--gtv-edge);
	}

	thead th {
		font-weight: 600;
		white-space: nowrap;
	}

	tbody th {
		font-weight: 400;
	}

	.num {
		text-align: right;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.focusing tbody tr {
		opacity: 0.3;
	}

	.focusing tbody tr.focused {
		opacity: 1;
		background-color: color-mix(in oklab, var(--gtv-mid) 12%, transparent);
	}
	/* spellchecker:on */
</style>
