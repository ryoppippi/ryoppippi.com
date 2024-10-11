import type rt from 'reading-time';
import type { Lang } from '$contents/types';

export type Metadata = {
	slug: string;
	title: string;
	pubDate: string;
	readingTime: ReturnType<typeof rt>;
	isPublished: boolean;
	lang: Lang;
};

export type Item = {
	slug: string;
} & Metadata;
