/**
 * Resolves the element id encoded in a navigation URL hash.
 *
 * @param url - Destination URL.
 * @returns The decoded target id, or null when the URL has no hash.
 */
export function hashTargetId(url: URL): string | null {
	const hash = url.hash.slice(1);
	if (hash.length === 0) {
		return null;
	}

	try {
		return decodeURIComponent(hash);
	} catch {
		return hash;
	}
}
