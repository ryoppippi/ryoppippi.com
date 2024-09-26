import { join } from 'node:path';
import { murmurHash, objectHash } from 'ohash';
import findCacheDirectory from 'find-cache-dir';

export { Json } from '@ryoppippi/limo';

/**
 * Get cache path
 */
export function getCachePath(name: string, data: unknown): string {
	const cacheHash = murmurHash(objectHash(data));
	const cacheDir = findCacheDirectory({ name, create: true });
	const cachePath = join(cacheDir ?? '', `${cacheHash}.json`);
	return cachePath;
}
