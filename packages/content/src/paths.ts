import path from 'node:path';

const contentRoot = path.resolve(import.meta.dirname, '..');

export function blogDirectory(root = contentRoot) {
	return path.join(root, 'src', 'blog');
}

export function showcaseDirectory(root = contentRoot) {
	return path.join(root, 'src', 'showcase');
}
