#!/usr/bin/env bun

import type { OgpData } from '@ox-content/vite-plugin';
import { prefetchOgpData } from '@ox-content/vite-plugin';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { saveOgpSnapshots } from '../src/ogp-snapshots.ts';

async function fetchOgp(urls: string[]): Promise<ReadonlyMap<string, OgpData | null>> {
	return prefetchOgpData(urls, { timeout: 8_000 });
}

for (const input of process.argv.slice(2)) {
	const filepath = path.resolve(process.cwd(), input);
	const content = await readFile(filepath, 'utf8').catch((error: unknown) => {
		if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
			return '';
		}
		throw error;
	});
	await saveOgpSnapshots(content, filepath, fetchOgp);
}
