import { createFixture } from 'fs-fixture';
import { loadBlogPost, loadBlogPostMetadata, loadBlogPostSource } from './blog.ts';

describe('blog loaders', () => {
	it('returns null for an unknown blog slug', async () => {
		await using fixture = await createFixture({
			'secret.md': '---\ntitle: Secret\ndate: 2026-06-22\nisPublished: true\n---\nSecret',
			content: {},
		});
		const renderContent = vi.fn(async (content: string) => content);

		await expect(
			loadBlogPost('../secret', renderContent, fixture.getPath('content')),
		).resolves.toBeNull();
		expect(renderContent).not.toHaveBeenCalled();
	});
	it('renders only the requested blog post', async () => {
		await using fixture = await createFixture({
			'first/index.md': '---\ntitle: First\ndate: 2026-06-21\nisPublished: true\n---\nFirst body',
			'second/index.md':
				'---\ntitle: Second\ndate: 2026-06-22\nisPublished: true\n---\nSecond body',
		});
		const renderContent = vi.fn(async (content: string) => `<p>${content}</p>`);

		const post = await loadBlogPost('second', renderContent, fixture.getPath());

		expect(renderContent).toHaveBeenCalledOnce();
		expect(renderContent).toHaveBeenCalledWith('Second body');
		expect(post).toEqual(expect.objectContaining({ filename: 'second', title: 'Second' }));
	});

	it('loads raw source without invoking a renderer', async () => {
		await using fixture = await createFixture({
			'first.md': '---\ntitle: First\ndate: 2025-01-01\n---\n\nFirst body',
		});

		expect(await loadBlogPostSource('first', fixture.getPath())).toContain('First body');
	});

	it('loads list metadata without rendered article HTML', async () => {
		await using fixture = await createFixture({
			'2026-06-22/index.md': [
				'---',
				'title: Lazy content',
				'date: 2026-06-22',
				'isPublished: true',
				"lang: 'en'",
				'---',
				'',
				'Hello world',
			].join('\n'),
		});

		const posts = await loadBlogPostMetadata(fixture.getPath());

		expect(posts).toEqual([
			expect.objectContaining({
				filename: '2026-06-22',
				isPublished: true,
				lang: 'en',
				title: 'Lazy content',
			}),
		]);
		expect(posts[0]).not.toHaveProperty('html');
	});
});
