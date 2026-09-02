import type { OgpOptions } from '@ox-content/vite-plugin';
import path from 'node:path';

const workspaceDirectory = path.resolve(import.meta.dirname, '../../..');

export const OPEN_GRAPH_OPTIONS = {
	cacheDir: path.join(workspaceDirectory, '.cache/ox-content/ogp'),
	persistCache: true,
	timeout: 8_000,
} as const satisfies OgpOptions;
