import type { TweetSnapshots } from './markdown/render.ts';
import type { TweetData } from './tweet-renderer.ts';
import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

export type FetchTweet = (id: string) => Promise<TweetData | null>;

function snapshotFilepath(articleFilepath: string): string {
	return path.basename(articleFilepath) === 'index.md'
		? path.join(path.dirname(articleFilepath), 'tweets.generated.json')
		: articleFilepath.replace(/\.md$/, '.tweets.generated.json');
}

function tweetIds(content: string): string[] {
	return [
		...new Set([...content.matchAll(/<Tweet\s+id=(['"])(\d+)\1\s*\/>/g)].map((match) => match[2])),
	];
}

async function readSnapshots(filepath: string): Promise<TweetSnapshots> {
	try {
		return JSON.parse(await readFile(filepath, 'utf8')) as TweetSnapshots;
	} catch (error) {
		if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
			return {};
		}
		throw error;
	}
}

export async function loadTweetSnapshots(
	content: string,
	articleFilepath: string,
): Promise<TweetSnapshots | undefined> {
	if (tweetIds(content).length === 0) {
		return undefined;
	}
	return readSnapshots(snapshotFilepath(articleFilepath));
}

export async function saveTweetSnapshots(
	content: string,
	articleFilepath: string,
	fetchMissingTweet: FetchTweet,
): Promise<string | null> {
	const filepath = snapshotFilepath(articleFilepath);
	const ids = tweetIds(content);
	if (ids.length === 0) {
		await rm(filepath, { force: true });
		return null;
	}

	const existing = await readSnapshots(filepath);
	const snapshots: TweetSnapshots = {};
	for (const id of ids) {
		const tweet = existing[id] ?? (await fetchMissingTweet(id));
		if (tweet != null) {
			snapshots[id] = tweet;
		}
	}

	const sorted = Object.fromEntries(
		Object.entries(snapshots).sort(([left], [right]) => left.localeCompare(right)),
	);
	await writeFile(filepath, `${JSON.stringify(sorted, null, '\t')}\n`);
	return filepath;
}

if (import.meta.vitest != null) {
	describe('tweet snapshots', () => {
		it('writes fetched tweets next to an index article', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'article/index.md': '<Tweet id="1234567890" />',
			});
			const tweet = { id_str: '1234567890' } as TweetData;

			await saveTweetSnapshots(
				'<Tweet id="1234567890" />',
				fixture.getPath('article/index.md'),
				async () => tweet,
			);

			expect(JSON.parse(await fixture.readFile('article/tweets.generated.json', 'utf8'))).toEqual({
				'1234567890': tweet,
			});
			expect(
				await loadTweetSnapshots('<Tweet id="1234567890" />', fixture.getPath('article/index.md')),
			).toEqual({ '1234567890': tweet });
		});

		it('keeps an unavailable tweet absent so rendering can fall back', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'article/index.md': '<Tweet id="1234567890" />',
			});

			await saveTweetSnapshots(
				'<Tweet id="1234567890" />',
				fixture.getPath('article/index.md'),
				async () => null,
			);

			expect(
				await loadTweetSnapshots('<Tweet id="1234567890" />', fixture.getPath('article/index.md')),
			).toEqual({});
		});
	});
}
