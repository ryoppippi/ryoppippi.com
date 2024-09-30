import type rt from 'reading-time';
import type { Lang } from '$contents/types';

export type Metadata = {
	title: string;
	date: string;
	isPublished: boolean;
	lang: Lang;
};

export type Item = {
	slug: string;
	pubDate: string;
	readingTime: ReturnType<typeof rt>;
} & Omit<Metadata, 'date'>;
