// string.js slugify drops non ascii chars so we have to
// use a custom implementation here
import { remove } from 'diacritics';

// eslint-disable-next-line no-control-regex
const rControl = /[\u0000-\u001F]/g;
const rSpecial = /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'<>,.?/]+/g;

/**
 * @param {string} str
 */
export function slugify(str) {
	return (
		remove(str)
		// Remove control characters
			.replace(rControl, '')
		// Replace special characters
			.replace(rSpecial, '-')
		// Remove continuous separators
			.replace(/-{2,}/g, '-')
		// Remove prefixing and trailing separators
			.replace(/^-+|-+$/g, '')
		// ensure it doesn't start with a number (#121)
			.replace(/^(\d)/, '_$1')
		// lowercase
			.toLowerCase()
	);
}
