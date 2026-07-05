#!/usr/bin/env bun

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fetchTweet } from '../src/tweet-fetch.ts';
import { saveTweetSnapshots } from '../src/tweet-snapshots.ts';

for (const input of process.argv.slice(2)) {
	const filepath = path.resolve(process.cwd(), input);
	const content = await readFile(filepath, 'utf8').catch((error: unknown) => {
		if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
			return '';
		}
		throw error;
	});
	await saveTweetSnapshots(content, filepath, fetchTweet);
}
