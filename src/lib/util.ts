import * as ufo from 'ufo';
import { assets } from '$app/paths';

type PartsObject = Record<keyof Intl.DateTimeFormatPartTypesRegistry, string>;

const options: Intl.DateTimeFormatOptions = {
	month: 'short',
	day: 'numeric',
	year: 'numeric',
};

const formatter = new Intl.DateTimeFormat('en-UK', options);

function partsArrayToObject(parts: ReturnType<typeof formatter.formatToParts>): PartsObject {
	const result = {} as PartsObject;

	for (const part of parts) {
		result[part.type] = part.value;
	}

	return result;
}

export function formatDate(date: Date) {
	const parts = partsArrayToObject(formatter.formatToParts(date));
	return `${parts.day} ${parts.month} ${parts.year}`;
}

export function domain() {
	// extract hostname from asset
	// eslint-disable-next-line ts/strict-boolean-expressions
	return assets || new URL(import.meta.url).hostname;
}

export function subdomain(...paths: string[]) {
	return ufo.joinURL(domain(), ...paths);
}
