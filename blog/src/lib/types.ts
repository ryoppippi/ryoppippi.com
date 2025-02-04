import type { Lang } from '@ryoppippi.com/types';
import type rt from 'reading-time';

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
