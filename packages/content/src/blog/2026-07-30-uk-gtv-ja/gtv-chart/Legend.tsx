import type { ChartLang } from './copy.ts';
import { resolveChartLang, uiCopy } from './copy.ts';

/**
 * Line-style legend for the timeline chart.
 *
 * @param props.lang - Chart language, falling back to Japanese.
 */
export default function Legend(props: { lang?: ChartLang }) {
	const copy = () => uiCopy[resolveChartLang(props.lang)].legend;

	return (
		<ul class='legend'>
			<li>
				<span aria-hidden='true' class='swatch swatch--mid' />
				{copy().mid}
			</li>
			<li>
				<span aria-hidden='true' class='swatch swatch--high' />
				{copy().high}
			</li>
			<li>
				<span aria-hidden='true' class='swatch swatch--low' />
				{copy().low}
			</li>
			<li>
				<span aria-hidden='true' class='swatch swatch--stars' />
				{copy().stars}
			</li>
			<li>
				<span aria-hidden='true' class='swatch swatch--after' />
				{copy().after}
			</li>
		</ul>
	);
}
