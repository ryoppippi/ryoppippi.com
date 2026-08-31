import path from 'node:path';

const contentRoot = path.resolve(import.meta.dirname);

export function blogDirectory(root = contentRoot) {
	return path.join(root, 'blog');
}

export function showcaseDirectory(root = contentRoot) {
	return path.join(root, 'showcase');
}
