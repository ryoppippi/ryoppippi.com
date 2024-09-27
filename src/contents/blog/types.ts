import type rt from 'reading-time';

export type Metadata = {
	title: string;
	date: string;
	isPublished: boolean;
	lang: 'en' | 'ja';
};

export type Item = {
	slug: string;
	pubDate: string;
	readingTime: ReturnType<typeof rt>;
} & Omit<Metadata, 'date'>;