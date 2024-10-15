import { error } from '@sveltejs/kit';
import type { tags } from 'typia';
import typia from 'typia';
import { parseJSON } from 'date-fns';
import type { PageServerLoad } from './$types';
import { formatDate } from '$lib/util';
import { slugify } from '$lib/slugify.server';
import type { Lang } from '$lib/../contents/types';

type URLString = string & tags.Format<'url'>;
export type Talk = {
	title: string;
	date: string;
	lang?: Lang;
	event: string;
	eventLink?: URLString;
	videoLink?: URLString;
	links: URLString[];
	content: string;
};

export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch('https://talks.ryoppippi.com/talks.json');
	if (!res.ok) {
		return error(res.status, 'Failed to fetch talks');
	}

	const talks = await res.json();

	typia.assertGuard<Talk[]>(talks);

	const talkWithParsedDate = talks.map(talk => ({
		...talk,
		date: formatDate(parseJSON(talk.date)),
		slug: slugify(talk.title + talk.date + talk.event),
		link: null,
	}));

	/* filter the talks don't happen yet */
	const today = new Date();
	const talksHappened = talkWithParsedDate.filter((talk) => {
		const talkDate = new Date(talk.date);
		return talkDate < today;
	});

	/* split by year */
	const talksByYear: Record<string, Talk[]> = {};
	talksHappened.forEach((talk) => {
		const year = new Date(talk.date).getFullYear().toString();
		if (talksByYear[year] == null) {
			talksByYear[year] = [];
		}
		talksByYear[year].push(talk);
	});

	return {
		talks: talksByYear,
		title: 'talks',
	};
};
