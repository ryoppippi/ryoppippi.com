import { hashTargetId } from './navigation.ts';

describe(hashTargetId, () => {
	it('resolves hash navigation targets', () => {
		expect(hashTargetId(new URL('https://example.com/post#fn-hpi'))).toBe('fn-hpi');
		expect(hashTargetId(new URL('https://example.com/post#%E8%AC%9D%E8%BE%9E'))).toBe('謝辞');
	});

	it('returns null for navigation without a hash', () => {
		expect(hashTargetId(new URL('https://example.com/post'))).toBeNull();
	});
});
