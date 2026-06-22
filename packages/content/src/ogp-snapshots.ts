import type { OgpData } from '@ox-content/vite-plugin';
import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

export type OgpSnapshots = Record<string, OgpData | null>;
export type FetchOgp = (urls: string[]) => Promise<ReadonlyMap<string, OgpData | null>>;

function snapshotFilepath(articleFilepath: string): string {
	return path.basename(articleFilepath) === 'index.md'
		? path.join(path.dirname(articleFilepath), 'ogp.generated.json')
		: articleFilepath.replace(/\.md$/, '.ogp.generated.json');
}

function previewUrls(content: string): string[] {
	return [
		...new Set(
			[...content.matchAll(/\[@preview\]\((https?:\/\/[^)\s]+)\)/g)].map((match) => match[1]),
		),
	];
}

async function readSnapshots(filepath: string): Promise<OgpSnapshots> {
	try {
		return JSON.parse(await readFile(filepath, 'utf8')) as OgpSnapshots;
	} catch (error) {
		if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
			return {};
		}
		throw error;
	}
}

export async function loadOgpSnapshots(
	content: string,
	articleFilepath: string,
): Promise<OgpSnapshots | undefined> {
	if (previewUrls(content).length === 0) {
		return undefined;
	}
	return readSnapshots(snapshotFilepath(articleFilepath));
}

export async function saveOgpSnapshots(
	content: string,
	articleFilepath: string,
	fetchMissingOgp: FetchOgp,
): Promise<string | null> {
	const filepath = snapshotFilepath(articleFilepath);
	const urls = previewUrls(content);
	if (urls.length === 0) {
		await rm(filepath, { force: true });
		return null;
	}

	const existing = await readSnapshots(filepath);
	const missingUrls = urls.filter((url) => !Object.hasOwn(existing, url));
	const fetched = await fetchMissingOgp(missingUrls);
	const snapshots = Object.fromEntries(
		urls
			.map(
				(url) =>
					[url, Object.hasOwn(existing, url) ? existing[url] : (fetched.get(url) ?? null)] as const,
			)
			.sort(([left], [right]) => left.localeCompare(right)),
	);
	await writeFile(filepath, `${JSON.stringify(snapshots, null, '\t')}\n`);
	return filepath;
}

if (import.meta.vitest != null) {
	describe('OGP snapshots', () => {
		it('writes fetched metadata next to an index article', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'article/index.md': '[@preview](https://example.com/post)',
			});
			const ogp = {
				url: 'https://example.com/post',
				title: 'Example post',
			} satisfies OgpData;

			await saveOgpSnapshots(
				'[@preview](https://example.com/post)',
				fixture.getPath('article/index.md'),
				async () => new Map([[ogp.url, ogp]]),
			);

			expect(JSON.parse(await fixture.readFile('article/ogp.generated.json', 'utf8'))).toEqual({
				[ogp.url]: ogp,
			});
			expect(
				await loadOgpSnapshots(
					'[@preview](https://example.com/post)',
					fixture.getPath('article/index.md'),
				),
			).toEqual({ [ogp.url]: ogp });
		});

		it('stores unavailable metadata to prevent repeated fetches', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'article/index.md': '[@preview](https://example.com/missing)',
			});

			await saveOgpSnapshots(
				'[@preview](https://example.com/missing)',
				fixture.getPath('article/index.md'),
				async () => new Map([['https://example.com/missing', null]]),
			);

			expect(
				await loadOgpSnapshots(
					'[@preview](https://example.com/missing)',
					fixture.getPath('article/index.md'),
				),
			).toEqual({ 'https://example.com/missing': null });
		});
	});
}
