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

export function capitalize(value: string) {
	return `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`;
}

export function lowercase(value: string) {
	return value.toLowerCase();
}

if (import.meta.vitest != null) {
	describe(formatDate, () => {
		it('formats dates with day, short month, and year', () => {
			expect(formatDate(new Date(2024, 0, 2))).toBe('2 Jan 2024');
		});
	});

	describe(capitalize, () => {
		it('uppercases the first character and lowercases the rest', () => {
			expect(capitalize('OSS')).toBe('Oss');
			expect(capitalize('showcase')).toBe('Showcase');
		});
	});

	describe(lowercase, () => {
		it('lowercases the whole string', () => {
			expect(lowercase('OSS')).toBe('oss');
		});
	});
}
