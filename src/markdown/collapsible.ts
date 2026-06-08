import { escapeHtml } from './html.ts';

type CollapsibleMarker = {
	marker: string;
	title: string;
	open: boolean;
};

function parseCollapsibleMarker(line: string): CollapsibleMarker | null {
	let indent = 0;
	while (indent < line.length && line[indent] === ' ') {
		indent += 1;
	}

	if (indent > 3) {
		return null;
	}

	const rest = line.slice(indent);
	let markerLength = 0;
	while (markerLength < rest.length && rest[markerLength] === '+') {
		markerLength += 1;
	}

	if (markerLength < 2) {
		return null;
	}

	const open = rest[markerLength] === '>';
	if (markerLength < 3 && !open) {
		return null;
	}

	const marker = `${'+'.repeat(markerLength)}${open ? '>' : ''}`;
	return {
		marker,
		title: rest.slice(marker.length).trim(),
		open,
	};
}

function renderCollapsibleSummary(title: string) {
	return `<summary><span class="details-marker"></span>${escapeHtml(title)}</summary>`;
}

export function transformCollapsibleBlocks(content: string) {
	const lines = content.split('\n');
	const markerStack: string[] = [];
	let inFence = false;
	let fenceMarker = '';
	let inScript = false;

	return lines.map((line) => {
		const trimmed = line.trimStart();
		const fence = trimmed.match(/^(`{3,}|~{3,})/)?.[1];

		if (inScript) {
			if (trimmed === '</script>') {
				inScript = false;
			}
			return line;
		}

		if (/^<script(?:\s|>)/.test(trimmed)) {
			inScript = true;
			return line;
		}

		if (fence != null) {
			if (!inFence) {
				inFence = true;
				fenceMarker = fence;
			}
			else if (trimmed.startsWith(fenceMarker[0]) && fence.length >= fenceMarker.length) {
				inFence = false;
				fenceMarker = '';
			}

			return line;
		}

		if (inFence) {
			return line;
		}

		const collapsible = parseCollapsibleMarker(line);
		if (collapsible == null) {
			return line;
		}

		if (collapsible.title.length === 0) {
			const lastMarker = markerStack.at(-1);
			if (lastMarker !== collapsible.marker) {
				return line;
			}

			markerStack.pop();
			return '</details>';
		}

		markerStack.push(collapsible.marker);
		return `<details${collapsible.open ? ' open' : ''}>${renderCollapsibleSummary(collapsible.title)}`;
	}).join('\n');
}

if (import.meta.vitest != null) {
	describe('transformCollapsibleBlocks', () => {
		it('converts collapsible blocks to details html', () => {
			expect(transformCollapsibleBlocks('+++ More\nbody\n+++')).toBe(
				'<details><summary><span class="details-marker"></span>More</summary>\nbody\n</details>',
			);
		});

		it('converts open collapsible blocks to open details html', () => {
			expect(transformCollapsibleBlocks('++> More\nbody\n++>')).toBe(
				'<details open><summary><span class="details-marker"></span>More</summary>\nbody\n</details>',
			);
		});

		it('leaves collapsible markers inside fenced code untouched', () => {
			expect(transformCollapsibleBlocks('```md\n+++ More\n```\n+++ Real\nbody\n+++')).toBe(
				'```md\n+++ More\n```\n<details><summary><span class="details-marker"></span>Real</summary>\nbody\n</details>',
			);
		});
	});
}
