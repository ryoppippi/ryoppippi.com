import type { PageServerLoad } from './$types';
import { Lang } from '$lib/../contents/types';
import { slugify } from '$lib/slugify.server';
import { formatDate } from '$lib/util';
import { error } from '@sveltejs/kit';
import { scope } from 'arktype';
import { parseJSON } from 'date-fns';

const { Talk } = scope({
	Lang,
	URLString: 'string.url#url',
	Talk: {
		'title': 'string',
		'date': 'string',
		'lang?': 'Lang',
		'event': 'string',
		'eventLink?': 'URLString',
		'videoLink?': 'URLString',
		'links': 'URLString[]',
		'content': 'string',
	},
}).export();

export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch('https://talks.ryoppippi.com/talks.json');
	if (!res.ok) {
		return error(res.status, 'Failed to fetch talks');
	}

	const _talks = await res.json();

	const talks = Talk.array().assert(_talks);

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
	const talksByYear: Record<string, typeof talksHappened> = {};
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
