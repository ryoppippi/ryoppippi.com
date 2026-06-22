import path from 'node:path';
import { blogDirectory } from '../src/paths.ts';

describe('blogDirectory', () => {
	it('targets the content workspace', () => {
		expect(blogDirectory('/workspace')).toBe(path.join('/workspace', 'src', 'blog'));
	});
});
