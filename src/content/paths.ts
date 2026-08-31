import path from 'node:path';

const contentRoot = path.resolve(import.meta.dirname);

export function blogDirectory(root = contentRoot) {
	return path.join(root, 'blog');
}

export function showcaseDirectory(root = contentRoot) {
	return path.join(root, 'showcase');
}

if (import.meta.vitest != null) {
	describe(blogDirectory, () => {
		it('targets the content directory', () => {
			expect(blogDirectory('/workspace')).toBe(path.join('/workspace', 'blog'));
		});
	});
}
