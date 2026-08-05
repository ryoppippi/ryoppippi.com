/**
 * Applies a line transform to everything outside fenced code blocks.
 *
 * Fenced code and HTML comments are left untouched so literal examples and
 * metadata do not get rewritten by Markdown preprocessing.
 *
 * @param content - Markdown source.
 * @param transform - Applied to each line outside a fence.
 * @returns The markdown with the transform applied.
 * @example
 * transformOutsideFences('a\n```\nb\n```', (line) => line.toUpperCase());
 * // 'A\n```\nb\n```'
 */
export function transformOutsideFences(
	content: string,
	transform: (line: string) => string,
): string {
	const lines = content.split('\n');
	let inFence = false;
	let fenceMarker = '';
	let inHtmlComment = false;

	return lines
		.map((line) => {
			const trimmed = line.trimStart();
			const fence = trimmed.match(/^(`{3,}|~{3,})/)?.[1];

			if (fence != null) {
				if (!inFence) {
					inFence = true;
					fenceMarker = fence;
				} else if (trimmed.startsWith(fenceMarker[0]) && fence.length >= fenceMarker.length) {
					inFence = false;
					fenceMarker = '';
				}

				return line;
			}

			if (inFence) {
				return line;
			}

			if (inHtmlComment) {
				if (line.includes('-->')) {
					inHtmlComment = false;
				}
				return line;
			}

			const commentStart = line.indexOf('<!--');
			if (commentStart !== -1) {
				inHtmlComment = line.indexOf('-->', commentStart + 4) === -1;
				return line;
			}

			return transform(line);
		})
		.join('\n');
}

if (import.meta.vitest != null) {
	describe(transformOutsideFences, () => {
		it('transforms lines outside fences', () => {
			expect(transformOutsideFences('a\nb', (line) => line.toUpperCase())).toBe('A\nB');
		});

		it('leaves fenced code untouched', () => {
			expect(transformOutsideFences('a\n```\nb\n```\nc', (line) => line.toUpperCase())).toBe(
				'A\n```\nb\n```\nC',
			);
		});

		it('only closes a fence with a marker at least as long as the opener', () => {
			expect(transformOutsideFences('````\na\n```\nb\n````\nc', (line) => line.toUpperCase())).toBe(
				'````\na\n```\nb\n````\nC',
			);
		});
	});
}
