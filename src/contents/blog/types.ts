import type { Lang } from '$contents/types';
import type rt from 'reading-time';

export type Metadata = {
	slug: string;
	title: string;
	pubDate: string;
	readingTime: ReturnType<typeof rt>;
	isPublished: boolean;
	lang: typeof Lang.infer;
};

export type Item = {
	slug: string;
} & Metadata;
