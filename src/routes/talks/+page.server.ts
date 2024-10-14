import { error } from '@sveltejs/kit';
import type { tags } from 'typia';
import typia from 'typia';
import { parseJSON } from 'date-fns';
import type { PageServerLoad } from './$types';
import { formatDate } from '$lib/util';
import { slugify } from '$lib/slugify.server';

export type Talk = {
	title: string;
	date: string;
	event: string;
	eventLink?: string & tags.Format<'url'>;
	videoLink?: string & tags.Format<'url'>;
	content: string;
	urls: string[];
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
		link: talk.urls[0],
	}));

	/* split by year */
	const talksByYear: Record<string, Talk[]> = {};
	talkWithParsedDate.forEach((talk) => {
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
