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
/**
 * Walks every comment delimiter on a line to see how it ends.
 *
 * A line can close one comment and open another, so a single `indexOf` pair
 * cannot decide this.
 *
 * @param line - The line to scan.
 * @param open - Whether a comment is already open when the line starts.
 * @returns Whether a comment is still open when the line ends.
 */
function endsInsideHtmlComment(line: string, open: boolean): boolean {
	let index = 0;
	let inComment = open;

	while (index < line.length) {
		const delimiter = inComment ? '-->' : '<!--';
		const found = line.indexOf(delimiter, index);
		if (found === -1) {
			return inComment;
		}

		index = found + delimiter.length;
		inComment = !inComment;
	}

	return inComment;
}

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
			// Before the fence check: a fence marker inside a comment is text, and
			// treating it as a fence would strand both states.
			if (inHtmlComment) {
				inHtmlComment = endsInsideHtmlComment(line, true);
				return line;
			}

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

			if (line.includes('<!--')) {
				inHtmlComment = endsInsideHtmlComment(line, false);
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

		it('reads a fence marker inside an HTML comment as text', () => {
			expect(transformOutsideFences('<!--\n```\n-->\na', (line) => line.toUpperCase())).toBe(
				'<!--\n```\n-->\nA',
			);
		});

		it('stays inside the comment reopened after a close on the same line', () => {
			expect(
				transformOutsideFences('<!-- a --> <!-- b\nc\n-->\nd', (line) => line.toUpperCase()),
			).toBe('<!-- a --> <!-- b\nc\n-->\nD');
		});
	});
}
