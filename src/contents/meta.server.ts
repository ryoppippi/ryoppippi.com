import { parse } from 'date-fns';
import rt from 'reading-time';

export function parseDate(date: string) {
	return parse(date, 'yyyy-MM-dd', new Date());
}

export function parseReadingTime(content: string) {
	return rt(content);
}
