import type { BlogPost } from './blog.ts';
import type { ShowcaseProject } from './showcase.ts';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

export type ContentArtifact = {
	posts: BlogPost[];
	showcase: ShowcaseProject[];
};

type ContentArtifactFile = ContentArtifact & {
	version: 1;
};

function isContentArtifactFile(value: unknown): value is ContentArtifactFile {
	return (
		typeof value === 'object' &&
		value != null &&
		'version' in value &&
		value.version === 1 &&
		'posts' in value &&
		Array.isArray(value.posts) &&
		'showcase' in value &&
		Array.isArray(value.showcase)
	);
}

export async function readContentArtifact(file: string): Promise<ContentArtifact> {
	const value: unknown = JSON.parse(await readFile(file, 'utf8'));
	if (!isContentArtifactFile(value)) {
		throw new Error('Unsupported content artifact version');
	}
	return { posts: value.posts, showcase: value.showcase };
}

export async function writeContentArtifact(file: string, artifact: ContentArtifact) {
	await mkdir(path.dirname(file), { recursive: true });
	const temporaryFile = `${file}.${process.pid}.${randomUUID()}.tmp`;
	const value = { ...artifact, version: 1 } satisfies ContentArtifactFile;
	await writeFile(temporaryFile, JSON.stringify(value));
	await rename(temporaryFile, file);
}

if (import.meta.vitest != null) {
	describe('content artifact', () => {
		it('round-trips rendered posts and showcases', async () => {
			const [{ createFixture }, { default: readingTime }] = await Promise.all([
				import('fs-fixture'),
				import('reading-time'),
			]);
			await using fixture = await createFixture();
			const posts = [
				{
					content: 'Hello',
					filename: 'hello',
					filepath: '/content/hello.md',
					html: '<p>Hello</p>',
					isPublished: true,
					lang: 'en',
					pubDate: '2026-06-22T00:00:00.000Z',
					readingTime: readingTime('Hello'),
					source: '---\ntitle: Hello\n---\nHello',
					title: 'Hello',
				} satisfies BlogPost,
			];
			const showcase = [
				{
					featured: true,
					html: '<p>Project</p>',
					link: 'https://example.com',
					pubDate: '2026-06-22T00:00:00.000Z',
					title: 'Project',
				} satisfies ShowcaseProject,
			];
			const file = fixture.getPath('dist/content.json');

			await writeContentArtifact(file, { posts, showcase });

			await expect(readContentArtifact(file)).resolves.toEqual({ posts, showcase });
		});

		it('rejects artifacts from another format version', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'content.json': JSON.stringify({ version: 0, posts: [], showcase: [] }),
			});

			await expect(readContentArtifact(fixture.getPath('content.json'))).rejects.toThrow(
				'Unsupported content artifact version',
			);
		});
	});
}
