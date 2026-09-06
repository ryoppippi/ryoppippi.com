export type PostListItem = {
	title: string;
	slug: string;
	link: string;
	pubDate: string;
	lang: string;
	external: boolean;
	kind?: 'article' | 'podcast' | 'video';
	playlist?: boolean;
	draft?: boolean;
};

export type ExternalPostInput = {
	title?: string | null;
	link?: string | null;
	pubDate?: string | null;
	guid?: string | null;
	lang?: string | null;
	kind?: 'article' | 'podcast' | 'video' | null;
	playlist?: boolean | null;
};

/** Normalizes a curated article or media item for site lists. */
export function toExternalPost(
	item: ExternalPostInput,
	defaultKind: NonNullable<PostListItem['kind']> = 'article',
): PostListItem | null {
	if (item.title == null || item.link == null || item.pubDate == null) {
		return null;
	}

	const pubDate = new Date(item.pubDate);
	if (Number.isNaN(pubDate.getTime())) {
		return null;
	}

	return {
		title: item.title,
		slug: item.guid ?? item.link,
		link: item.link,
		pubDate: pubDate.toJSON(),
		lang: item.lang ?? 'ja',
		external: true,
		kind: item.kind ?? defaultKind,
		...(item.playlist === true ? { playlist: true } : {}),
	};
}
