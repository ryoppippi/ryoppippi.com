import path from 'node:path';

const contentRoot = path.resolve(import.meta.dirname, '..');

export function blogDirectory(root = contentRoot) {
	return path.join(root, 'src', 'blog');
}

export function showcaseDirectory(root = contentRoot) {
	return path.join(root, 'src', 'showcase');
}

/**
 * Directory Svelte measures component paths against when it derives a style
 * scope class.
 *
 * `rootDir` defaults to the working directory, and the content artifact is
 * built from the content package while the site is built from the workspace
 * root. Both builds pin it here instead, so a component gets the same scope
 * class either way and the stylesheet the site build emits matches the markup
 * the content build renders.
 *
 * @param root - Content package root, overridable for tests.
 * @returns Absolute path of the workspace root.
 */
export function svelteRootDir(root = contentRoot): string {
	return path.resolve(root, '..', '..');
}

if (import.meta.vitest != null) {
	describe(blogDirectory, () => {
		it('targets the content workspace', () => {
			expect(blogDirectory('/workspace')).toBe(path.join('/workspace', 'src', 'blog'));
		});
	});

	describe(svelteRootDir, () => {
		it('resolves to the workspace root above the content package', () => {
			expect(svelteRootDir(path.join('/workspace', 'packages', 'content'))).toBe('/workspace');
		});
	});
}
