import path from 'node:path';

const contentRoot = path.resolve(import.meta.dirname, '..');

export function blogDirectory(root = contentRoot) {
	return path.join(root, 'src', 'blog');
}

export function showcaseDirectory(root = contentRoot) {
	return path.join(root, 'src', 'showcase');
}

if (import.meta.vitest != null) {
	describe(blogDirectory, () => {
		it('targets the content workspace', () => {
			expect(blogDirectory('/workspace')).toBe(path.join('/workspace', 'src', 'blog'));
		});
	});
}
