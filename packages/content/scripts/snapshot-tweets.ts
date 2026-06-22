#!/usr/bin/env bun

import type { TweetData } from '../src/tweet-renderer.ts';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { getTweet } from 'sveltweet/api';
import { saveTweetSnapshots } from '../src/tweet-snapshots.ts';

async function fetchVercelTweet(id: string): Promise<TweetData | null> {
	try {
		const response = await fetch(`https://react-tweet.vercel.app/api/tweet/${id}`);
		if (response.ok) {
			const body = (await response.json()) as { data?: TweetData };
			return body.data ?? null;
		}
	} catch {}
	return null;
}

async function fetchTweet(id: string): Promise<TweetData | null> {
	const vercelTweet = await fetchVercelTweet(id);
	if (vercelTweet != null) {
		return vercelTweet;
	}

	for (let attempt = 0; attempt < 3; attempt += 1) {
		try {
			const tweet = await getTweet(id);
			if (tweet != null) {
				return tweet;
			}
		} catch {
			if (attempt < 2) {
				await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
			}
		}
	}
	return null;
}

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
