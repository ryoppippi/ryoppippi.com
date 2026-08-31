import path from 'node:path';

const contentRoot = path.resolve(import.meta.dirname);

export function blogDirectory(root = contentRoot) {
	return path.join(root, 'blog');
}

export function showcaseDirectory(root = contentRoot) {
	return path.join(root, 'showcase');
}

/**
 * Directory Svelte measures component paths against when it derives a style
 * scope class.
 *
 * `rootDir` defaults to the working directory. Pinning it to the repository
 * root keeps Svelte scope classes stable for content islands and site pages.
 *
 * @param root - Content source root, overridable for tests.
 * @returns Absolute path of the workspace root.
 */
export function svelteRootDir(root = contentRoot): string {
	return path.resolve(root, '..', '..');
}

if (import.meta.vitest != null) {
	describe(blogDirectory, () => {
		it('targets the content directory', () => {
			expect(blogDirectory('/workspace')).toBe(path.join('/workspace', 'blog'));
		});
	});

	describe(svelteRootDir, () => {
		it('resolves to the workspace root above the content directory', () => {
			expect(svelteRootDir(path.join('/workspace', 'src', 'content'))).toBe('/workspace');
		});
	});
}
