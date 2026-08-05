<ul class='legend'>
	<li><span class='swatch swatch--mid'></span>中央推定（左軸）</li>
	<li><span class='swatch swatch--high'></span>高め</li>
	<li><span class='swatch swatch--low'></span>低め</li>
	<li><span class='swatch swatch--stars'></span>ccusage stars（右軸）</li>
	<li><span class='swatch swatch--after'></span>提出後（審査対象外）</li>
</ul>

<style>
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 1rem;
		margin: 0 0 0.75rem;
		padding: 0;
		font-size: 0.8125rem;
		list-style: none;
	}

	.legend li {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin: 0;
	}

	.swatch {
		width: 1.25rem;
		height: 0;
		border-top-width: 2px;
		border-top-style: solid;
	}

	.swatch--mid {
		border-top-color: var(--gtv-mid);
	}

	.swatch--high {
		border-top-style: dashed;
		border-top-color: var(--gtv-edge);
	}

	.swatch--low {
		border-top-style: dotted;
		border-top-color: var(--gtv-edge);
	}

	.swatch--stars {
		border-top-color: var(--gtv-stars);
	}

	.swatch--after {
		border-top-style: dashed;
		border-top-color: var(--gtv-stars);
	}
</style>
