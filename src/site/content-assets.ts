import type { DefaultTreeAdapterMap } from 'parse5';
import { createHash } from 'node:crypto';
import { link, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseFragment, serialize } from 'parse5';
import { glob } from 'tinyglobby';

export type ContentAssetSource = {
	source: string;
	url: string;
};

export type EmittedContentAssets = {
	urls: ReadonlyMap<string, string>;
};

export async function contentAssetSources(
	blogDir: string,
	showcaseDir: string,
): Promise<ContentAssetSource[]> {
	const [blogAssets, showcaseAssets] = await Promise.all([
		glob(['**/*', '!**/*.md', '!**/*.generated.json'], { cwd: blogDir, onlyFiles: true }),
		glob(['**/*', '!**/*.md', '!**/index.ts'], { cwd: showcaseDir, onlyFiles: true }),
	]);
	const publicUrl = (...parts: string[]) =>
		`/${parts
			.flatMap((part) => part.split('/'))
			.map(encodeURIComponent)
			.join('/')}`;

	return [
		...blogAssets
			.filter((asset) => asset.includes('/'))
			.map((asset) => ({
				source: path.join(blogDir, asset),
				url: publicUrl('blog', asset),
			})),
		...showcaseAssets.map((asset) => ({
			source: path.join(showcaseDir, asset),
			url: publicUrl('works', 'showcase', 'assets', asset),
		})),
	];
}

export async function emitDeduplicatedAssets(
	sources: readonly ContentAssetSource[],
	outDir: string,
): Promise<EmittedContentAssets> {
	const loaded = await Promise.all(
		sources.map(async (asset) => {
			const content = await readFile(asset.source);
			return {
				...asset,
				content,
				hash: createHash('sha256').update(content).digest('hex'),
			};
		}),
	);
	const emitted = new Map<string, { content: Buffer; target: string }>();
	const urls = new Map<string, string>();

	for (const asset of loaded) {
		let output = emitted.get(asset.hash);
		if (output == null) {
			const extension = path.extname(asset.source).toLowerCase();
			output = {
				content: asset.content,
				target: `/assets/content/${asset.hash}${extension}`,
			};
			emitted.set(asset.hash, output);
		}
		urls.set(asset.url, output.target);
	}

	await mkdir(path.join(outDir, 'assets', 'content'), { recursive: true });
	await Promise.all(
		[...emitted.values()].map((asset) =>
			writeFile(path.join(outDir, asset.target.slice(1)), asset.content),
		),
	);
	await Promise.all(
		loaded.map(async (asset) => {
			const target = urls.get(asset.url);
			if (target == null) {
				throw new Error(`Missing emitted asset for ${asset.url}`);
			}
			const alias = path.join(
				outDir,
				...asset.url.split('/').filter(Boolean).map(decodeURIComponent),
			);
			await mkdir(path.dirname(alias), { recursive: true });
			await link(path.join(outDir, target.slice(1)), alias);
		}),
	);

	return { urls };
}

export function rewriteContentAssetUrls(
	html: string,
	basePath: string,
	urls: ReadonlyMap<string, string>,
): string {
	const origin = new URL('https://content.invalid');
	const base = new URL(basePath, origin);
	const fragment = parseFragment(html);

	function visit(node: DefaultTreeAdapterMap['node']): void {
		if ('attrs' in node) {
			for (const attribute of node.attrs) {
				if (!['href', 'poster', 'src'].includes(attribute.name)) {
					continue;
				}
				const resolved = new URL(attribute.value, base);
				if (resolved.origin !== origin.origin) {
					continue;
				}
				const replacement = urls.get(resolved.pathname);
				if (replacement != null) {
					attribute.value = replacement;
				}
			}
		}
		if ('childNodes' in node) {
			for (const child of node.childNodes) {
				visit(child);
			}
		}
	}

	visit(fragment);
	return serialize(fragment);
}

if (import.meta.vitest != null) {
	describe(contentAssetSources, () => {
		it('lists non-Markdown assets with encoded public URLs', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'blog/post/index.md': '# Post',
				'blog/post/image one.png': 'image',
				'blog/post/tweets.generated.json': '{}',
				'blog/post/ogp.generated.json': '{}',
				'showcase/project.md': '# Project',
				'showcase/project cover.jpg': 'cover',
				'showcase/index.ts': 'export {}',
			});

			const sources = await contentAssetSources(
				fixture.getPath('blog'),
				fixture.getPath('showcase'),
			);

			expect(sources).toEqual([
				{
					source: fixture.getPath('blog/post/image one.png'),
					url: '/blog/post/image%20one.png',
				},
				{
					source: fixture.getPath('showcase/project cover.jpg'),
					url: '/works/showcase/assets/project%20cover.jpg',
				},
			]);
		});
	});

	describe(emitDeduplicatedAssets, () => {
		it('emits identical asset contents once', async () => {
			const [{ createFixture }, { readdir }] = await Promise.all([
				import('fs-fixture'),
				import('node:fs/promises'),
			]);
			await using fixture = await createFixture({
				'input/first.png': 'same image',
				'input/second.png': 'same image',
				'input/unique.jpg': 'unique image',
			});

			await emitDeduplicatedAssets(
				[
					{ source: fixture.getPath('input/first.png'), url: '/blog/first/image.png' },
					{ source: fixture.getPath('input/second.png'), url: '/blog/second/image.png' },
					{ source: fixture.getPath('input/unique.jpg'), url: '/showcase/unique.jpg' },
				],
				fixture.getPath('output'),
			);

			const output = await readdir(fixture.getPath('output/assets/content'));
			expect(output).toHaveLength(2);
		});

		it('maps legacy URLs to content-addressed assets and emits static aliases', async () => {
			const [{ createFixture }, { readFile, stat }] = await Promise.all([
				import('fs-fixture'),
				import('node:fs/promises'),
			]);
			await using fixture = await createFixture({
				'input/first.png': 'same image',
				'input/second.png': 'same image',
			});

			const result = await emitDeduplicatedAssets(
				[
					{ source: fixture.getPath('input/first.png'), url: '/blog/first/image.png' },
					{ source: fixture.getPath('input/second.png'), url: '/blog/second/image.png' },
				],
				fixture.getPath('output'),
			);

			expect(result.urls.get('/blog/first/image.png')).toMatch(
				/^\/assets\/content\/[\da-f]{64}\.png$/,
			);
			expect(result.urls.get('/blog/second/image.png')).toBe(
				result.urls.get('/blog/first/image.png'),
			);
			expect(await readFile(fixture.getPath('output/blog/first/image.png'), 'utf8')).toBe(
				'same image',
			);
			expect(await readFile(fixture.getPath('output/blog/second/image.png'), 'utf8')).toBe(
				'same image',
			);
			expect((await stat(fixture.getPath('output/blog/first/image.png'))).nlink).toBe(3);
		});
	});

	describe(rewriteContentAssetUrls, () => {
		it('rewrites local asset attributes without changing external URLs', () => {
			const html =
				'<p><img src="./image.png" alt="local"><a href="https://example.com/image.png">external</a></p>';

			const rewritten = rewriteContentAssetUrls(
				html,
				'/blog/post/',
				new Map([['/blog/post/image.png', '/assets/content/digest.png']]),
			);

			expect(rewritten).toContain('src="/assets/content/digest.png"');
			expect(rewritten).toContain('href="https://example.com/image.png"');
		});
	});
}
