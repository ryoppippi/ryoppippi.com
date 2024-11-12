import type { Lang } from '$lib/../contents/types';
import type { tags } from 'typia';
import type { PageServerLoad } from './$types';
import { slugify } from '$lib/slugify.server';
import { formatDate } from '$lib/util';
import { error } from '@sveltejs/kit';
import { parseJSON } from 'date-fns';
import typia from 'typia';

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

	/* hide future talks */
	const today = new Date();
	const talksHappened = talkWithParsedDate.map((talk) => {
		if (new Date(talk.date) < today) {
			return talk;
		}

		return {
			...talk,
			links: [],
			content: '',
		};
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
