import { assets } from '$app/paths';
import * as ufo from 'ufo';

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
	return URL.canParse(assets) ? new URL(assets).hostname : 'ryoppippi.com';
}

export function subdomain(...paths: string[]) {
	return ufo.joinURL(assets, ...paths);
}
