import { createFixture } from 'fs-fixture';
import readingTime from 'reading-time';
import type { BlogPost } from './blog.ts';
import type { ShowcaseProject } from './showcase.ts';
import { readContentArtifact, writeContentArtifact } from './artifact.ts';

describe('content artifact', () => {
	it('round-trips rendered posts and showcases', async () => {
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
		await using fixture = await createFixture({
			'content.json': JSON.stringify({ version: 0, posts: [], showcase: [] }),
		});

		await expect(readContentArtifact(fixture.getPath('content.json'))).rejects.toThrow(
			'Unsupported content artifact version',
		);
	});
});
