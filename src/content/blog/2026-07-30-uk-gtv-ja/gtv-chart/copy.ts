import type { GtvPoint } from './data.ts';
import { GTV_POINTS } from './data.ts';

export const CHART_LANGS = ['ja', 'en'] as const;

export type ChartLang = (typeof CHART_LANGS)[number];

type UiCopy = {
	legend: {
		mid: string;
		high: string;
		low: string;
		stars: string;
		after: string;
	};
	figcaption: string;
	table: {
		regionLabel: string;
		caption: string;
		date: string;
		low: string;
		mid: string;
		high: string;
		stars: string;
		notes: string;
		headingOpen: string;
		headingClose: string;
		frozen: string;
		almostZero: string;
	};
	chart: {
		ariaLabel: string;
		ariaDescription: string;
		dateLocale: string;
	};
	series: {
		low: string;
		mid: string;
		high: string;
		stars: string;
	};
};

type TimelineText = {
	label?: string;
	milestone: string;
	evidence: string;
	links?: readonly { readonly text: string; readonly href: string }[];
};

export const uiCopy = {
	ja: {
		legend: {
			mid: '中央推定（左軸）',
			high: '高め',
			low: '低め',
			stars: 'ccusage stars（右軸）',
			after: '提出後（審査対象外）',
		},
		figcaption:
			'通過見込みはLLMに推定させた値で、実測値ではない。提出書類の構成や審査戦略を示すものでもない。推定方法は冒頭のdetailsを参照。',
		table: {
			regionLabel: 'グラフの数値データ',
			caption: '申請時点ごとの通過見込みとccusageのstar数',
			date: '時点（年/月）',
			low: '低め',
			mid: '中央',
			high: '高め',
			stars: 'ccusage stars',
			notes: '備考',
			headingOpen: '（',
			headingClose: '）',
			frozen: '凍結',
			almostZero: 'ほぼ0',
		},
		chart: {
			ariaLabel: '申請時点までの通過見込みの推定とccusageのstar数の推移',
			ariaDescription: '矢印キーで時点を移動できる。詳しい値は直後の表にも掲載している。',
			dateLocale: 'ja-JP',
		},
		series: {
			low: '低め',
			mid: '中央',
			high: '高め',
			stars: 'ccusage stars',
		},
	},
	en: {
		legend: {
			mid: 'Central estimate (left axis)',
			high: 'High',
			low: 'Low',
			stars: 'ccusage stars (right axis)',
			after: 'After submission (not assessed)',
		},
		figcaption:
			'Pass probabilities are LLM estimates, not measurements. They do not prescribe a document structure or an assessment strategy. See the details at the top for how they were estimated.',
		table: {
			regionLabel: 'Numeric data for the chart',
			caption: 'Estimated pass probability and ccusage star count at each point',
			date: 'Point (year/month)',
			low: 'Low',
			mid: 'Central',
			high: 'High',
			stars: 'ccusage stars',
			notes: 'Notes',
			headingOpen: ' (',
			headingClose: ')',
			frozen: 'frozen',
			almostZero: 'nearly 0',
		},
		chart: {
			ariaLabel:
				'Estimated pass probability up to each application point, and ccusage star history',
			ariaDescription:
				'Arrow keys move between points. The table immediately below has the detailed values.',
			dateLocale: 'en-GB',
		},
		series: {
			low: 'Low',
			mid: 'Central',
			high: 'High',
			stars: 'ccusage stars',
		},
	},
} as const satisfies Record<ChartLang, UiCopy>;

export const timelineEn = {
	'2023-10-01T23:59:59Z': {
		milestone: 'Over 5 years of experience',
		evidence:
			"First start-up (until Jun '23) + contracting period. Over 5 years of experience by this point; part of my career context rather than a standalone route test",
	},
	'2024-04-01T23:59:59Z': {
		milestone: 'Turning point',
		evidence:
			'RA contract ended. Unstable on the employment side, but this is when I began doing more OSS work',
	},
	'2024-11-23T23:59:59Z': {
		milestone: 'OSS work and talks in English',
		evidence: '16 new projects, typia, and talks in English → led to interview opportunities',
		links: [
			{ text: 'typia', href: 'https://github.com/samchon/typia' },
			{ text: 'talks in English', href: 'https://neovimconf.live/' },
		],
	},
	'2025-03-01T23:59:59Z': {
		milestone: 'WRTN',
		evidence: 'typia contributions helped lead to a job',
	},
	'2025-05-29T23:59:59Z': {
		milestone: 'ccusage launch',
		evidence:
			'An OSS project is born. Built in the roughly one month between the StackOne offer and joining. No adoption yet at launch. Published an intro on Zenn the same day',
		links: [
			{
				text: 'intro on Zenn',
				href: '/blog/2025-05-29-zenn-6c9a8fe6629cd6-ja',
			},
		],
	},
	'2025-06-18T23:59:59Z': {
		milestone: 'ccusage 1K',
		evidence:
			'1K stars in 20 days, 24K downloads, 44 releases. Overseas contributors and GUI/Raycast forks appeared, moving from a mere launch to community adoption. This was while I had left my previous job and was waiting to join the next one',
		links: [
			{
				text: '1K stars in 20 days',
				href: '/blog/2025-06-18-zenn-aad087994f26a7-ja',
			},
		],
	},
	'2025-06-23T23:59:59Z': {
		milestone: 'Joined StackOne',
		evidence:
			'Local employment at a UK company. I was hired by a UK product-led technology company; the work that followed later formed part of the application record. Impact was still limited just after joining',
		links: [
			{
				text: 'Local employment at a UK company',
				href: '/blog/2025-07-06-how-to-get-job-in-the-uk-en',
			},
			{
				text: 'UK product-led technology company',
				href: '/blog/2026-01-07-recap-2025-ja',
			},
		],
	},
	'2025-07-26T23:59:59Z': {
		label: "'25/late Jul",
		milestone: 'ccusage 5K',
		evidence: 'About 5K stars. ccusage became closely associated with my public work',
	},
	'2025-10-16T23:59:59Z': {
		milestone: 'TOYOKUMO',
		evidence:
			'Selected for the Thanks OSS Award 2025 second half (Jul–Dec). The company published the winners in a press release, providing an independent public record',
		links: [
			{
				text: 'Thanks OSS Award',
				href: 'https://www.toyokumo.co.jp/2025/10/16/oss-award-2025-lasthalf',
			},
		],
	},
	'2025-11-02T23:59:59Z': {
		milestone: 'Events in Japan',
		evidence: '5 talks. Recognition spread inside the developer community',
		links: [
			{
				text: '5 talks',
				href: '/blog/2025-11-06-japan-trip-en',
			},
		],
	},
	'2025-12-01T23:59:59Z': {
		milestone: 'YouTube published',
		evidence:
			'Submitted 2 TECH WORLD videos, 5 in total including other outlets. Reached beyond the community and remains watchable later',
		links: [
			{
				text: 'TECH WORLD',
				href: 'https://www.youtube.com/@TECHWORLD111',
			},
			{
				text: '5 in total',
				href: '/blog/2025-11-06-japan-trip-en',
			},
		],
	},
	'2026-01-10T23:59:59Z': {
		milestone: 'Rork offer',
		evidence:
			'Founding Engineer offer. A concrete external signal that a UK company valued my work',
	},
	'2026-01-17T23:59:59Z': {
		milestone: 'Software Design February issue',
		evidence:
			'Contributed the lead feature in a commercial magazine. The publisher invited me to write',
		links: [
			{
				text: 'Contributed the lead feature in a commercial magazine',
				href: 'https://gihyo.jp/magazine/SD/archive/2026/202602',
			},
		],
	},
	'2026-02-01T23:59:59Z': {
		milestone: 'Rork Max',
		evidence: 'Rork Max launch. $1.5M ARR in 3 days',
		links: [
			{
				text: '$1.5M ARR in 3 days',
				href: 'https://rorklab.net/en/articles/rork-business/rork-15m-seed-paperline-acquisition-what-changes',
			},
		],
	},
	'2026-03-01T23:59:59Z': {
		milestone: '3 recommendation letters',
		evidence:
			'Not new achievements, but third parties in different positions explaining what the existing ones meant',
	},
	'2026-04-20T23:59:59Z': {
		milestone: 'Submitted',
		evidence:
			'Documents assembled and submitted. The LLM estimates stop here; later stars are shown only as post-submission context',
	},
	'2026-05-29T23:59:59Z': {
		milestone: 'Passed 15K',
		evidence: 'Exactly one year after launch',
	},
	'2026-08-09T23:59:59Z': {
		milestone: 'Now',
		evidence: '+4.9K from about 12.9K at submission. The increase is post-submission context, not part of the estimate',
	},
} as const satisfies Record<string, TimelineText>;

// String-keyed view of `timelineEn`, because lookups use arbitrary point dates
// while the literal type only accepts its own keys.
const timelineTextByDate: Record<string, TimelineText | undefined> = timelineEn;

/**
 * Narrows an unknown island prop to a chart language.
 *
 * @param value - Value received as a component prop.
 * @returns True when the value is a supported language.
 */
export function isChartLang(value: unknown): value is ChartLang {
	return value === 'ja' || value === 'en';
}

/**
 * Falls back to Japanese when the island prop is missing or unknown.
 *
 * @param value - Value received as a component prop.
 * @returns A supported chart language.
 */
export function resolveChartLang(value: unknown): ChartLang {
	return isChartLang(value) ? value : 'ja';
}

/**
 * Overlays English table text onto a timeline point.
 *
 * Japanese stays on the source JSON. English lives here so the same numbers
 * and dates are not copied.
 *
 * @param point - A timeline point, usually already joined with star counts.
 * @param lang - Language to render.
 * @returns The point with milestone, evidence, and links in that language.
 */
export function localisePoint<T extends GtvPoint>(point: T, lang: ChartLang): T {
	if (lang === 'ja') {
		return point;
	}

	const text = timelineTextByDate[point.date];
	if (text == null) {
		return point;
	}

	return {
		...point,
		label: text.label ?? point.label,
		milestone: text.milestone,
		evidence: text.evidence,
		links: text.links ?? point.links,
	};
}

if (import.meta.vitest != null) {
	describe(resolveChartLang, () => {
		it('keeps a supported language', () => {
			expect(resolveChartLang('en')).toBe('en');
		});

		it('falls back to Japanese for an unknown value', () => {
			expect(resolveChartLang('fr')).toBe('ja');
		});
	});

	describe(localisePoint, () => {
		it('has English copy for every timeline point', () => {
			for (const point of GTV_POINTS) {
				expect(timelineTextByDate[point.date], point.date).toBeDefined();
			}
		});

		it('leaves Japanese points unchanged', () => {
			const point = GTV_POINTS[0];

			expect(localisePoint(point, 'ja')).toBe(point);
		});

		it('swaps milestone and evidence for English', () => {
			const point = GTV_POINTS.find((entry) => entry.date === '2023-10-01T23:59:59Z');
			assert.isDefined(point);

			expect(localisePoint(point, 'en')).toEqual(
				expect.objectContaining({
					milestone: 'Over 5 years of experience',
					evidence: expect.stringContaining('Over 5 years'),
				}),
			);
		});

		it('rewrites English link phrases so they still match the evidence', () => {
			const point = GTV_POINTS.find((entry) => entry.date === '2025-06-23T23:59:59Z');
			assert.isDefined(point);
			const localised = localisePoint(point, 'en');
			const firstLink = localised.links?.[0];
			assert.isDefined(firstLink);

			expect(localised.evidence).toContain(firstLink.text);
			expect(firstLink.href).toBe('/blog/2025-07-06-how-to-get-job-in-the-uk-en');
		});
	});
}
