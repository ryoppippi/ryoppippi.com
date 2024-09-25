import { createHash } from 'node:crypto';
import { join } from 'node:path';
import findCacheDirectory from 'find-cache-dir';

export { Json } from '@ryoppippi/limo';

/**
 * Get cache path
 */
export function getCachePath(name: string, data: unknown): string {
	const cacheHash = createHash('md5').update(JSON.stringify(data as any)).digest('hex');
	const cacheDir = findCacheDirectory({ name, create: true });
	const cachePath = join(cacheDir ?? '', `${cacheHash}.json`);
	return cachePath;
}
