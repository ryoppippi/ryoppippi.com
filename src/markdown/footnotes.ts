import { slugify } from '../lib/slugify.server.ts';

export type FootnoteDefinition = {
	content: string;
	firstReferenceId: string;
	id: string;
	index: number;
	key: string;
};

type CollectedFootnotes = {
	content: string;
	footnotes: FootnoteDefinition[];
	footnoteMap: Map<string, FootnoteDefinition>;
};

function fenceMarker(line: string) {
	return line.trimStart().match(/^(`{3,}|~{3,})/)?.[1];
}

function normalizeFootnoteId(key: string, usedIds: Set<string>, index: number) {
	const slug = slugify(key).replace(/^_+/, '');
	const base = slug.length > 0 ? slug : `footnote-${index + 1}`;
	let id = base;
	let suffix = 2;

	while (usedIds.has(id)) {
		id = `${base}-${suffix}`;
		suffix += 1;
	}

	usedIds.add(id);
	return id;
}

function collectFootnotes(content: string): CollectedFootnotes {
	const lines = content.split('\n');
	const output: string[] = [];
	const footnotes: FootnoteDefinition[] = [];
	const footnoteMap = new Map<string, FootnoteDefinition>();
	const usedIds = new Set<string>();
	let inFence = false;
	let openFence = '';
	let inScript = false;

	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index];
		const trimmed = line.trimStart();
		const marker = fenceMarker(line);

		if (inScript) {
			output.push(line);
			if (trimmed === '</script>') {
				inScript = false;
			}
			continue;
		}
		if (/^<script(?:\s|>)/.test(trimmed)) {
			inScript = true;
			output.push(line);
			continue;
		}
		if (marker != null) {
			if (!inFence) {
				inFence = true;
				openFence = marker;
			} else if (marker[0] === openFence[0] && marker.length >= openFence.length) {
				inFence = false;
				openFence = '';
			}
			output.push(line);
			continue;
		}
		if (inFence) {
			output.push(line);
			continue;
		}

		const definition = line.match(/^\[\^([^\]]+)\]:/);
		if (definition == null) {
			output.push(line);
			continue;
		}

		const key = definition[1];
		const definitionLines = [line.slice(definition[0].length).replace(/^[ \t]+/, '')];
		while (index + 1 < lines.length) {
			const nextLine = lines[index + 1];
			if (/^(?: {4}|\t)/.test(nextLine)) {
				definitionLines.push(nextLine.replace(/^(?: {4}|\t)/, ''));
				index += 1;
				continue;
			}
			if (
				nextLine === '' &&
				index + 2 < lines.length &&
				(/^(?: {4}|\t)/.test(lines[index + 2]) || lines[index + 2] === '')
			) {
				definitionLines.push('');
				index += 1;
				continue;
			}
			break;
		}

		const footnote = {
			content: definitionLines.join('\n').trim(),
			firstReferenceId: `fnref-${footnotes.length + 1}`,
			id: normalizeFootnoteId(key, usedIds, footnotes.length),
			index: footnotes.length + 1,
			key,
		} satisfies FootnoteDefinition;
		footnotes.push(footnote);
		footnoteMap.set(key, footnote);
	}

	return { content: output.join('\n'), footnotes, footnoteMap };
}

function replaceFootnoteReferences(content: string, footnoteMap: Map<string, FootnoteDefinition>) {
	const referenceCounts = new Map<string, number>();
	let inFence = false;
	let openFence = '';
	let inScript = false;

	return content
		.split('\n')
		.map((line) => {
			const trimmed = line.trimStart();
			const marker = fenceMarker(line);
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
			if (marker != null) {
				if (!inFence) {
					inFence = true;
					openFence = marker;
				} else if (marker[0] === openFence[0] && marker.length >= openFence.length) {
					inFence = false;
					openFence = '';
				}
				return line;
			}
			if (inFence) {
				return line;
			}

			return line
				.split(/(`[^`]*`)/)
				.map((segment, index) => {
					if (index % 2 === 1) {
						return segment;
					}
					return segment.replace(/\[\^([^\]]+)\]/g, (match, key: string) => {
						const footnote = footnoteMap.get(key);
						if (footnote == null) {
							return match;
						}

						const count = (referenceCounts.get(footnote.id) ?? 0) + 1;
						referenceCounts.set(footnote.id, count);
						const referenceId =
							count === 1 ? `fnref-${footnote.id}` : `fnref-${footnote.id}-${count}`;
						if (count === 1) {
							footnote.firstReferenceId = referenceId;
						}
						return `<sup class="footnote-ref"><a href="#fn-${footnote.id}" id="${referenceId}">${footnote.index}</a></sup>`;
					});
				})
				.join('');
		})
		.join('\n');
}

export function extractFootnotes(content: string) {
	const collected = collectFootnotes(content);
	return {
		content: replaceFootnoteReferences(collected.content, collected.footnoteMap),
		footnotes: collected.footnotes,
	};
}

export async function renderFootnotes(
	footnotes: FootnoteDefinition[],
	renderMarkdown: (content: string) => Promise<string>,
) {
	if (footnotes.length === 0) {
		return '';
	}

	const items = await Promise.all(
		footnotes.map(async (footnote) => {
			const content = (await renderMarkdown(footnote.content)).trim();
			return `<li id="fn-${footnote.id}">\n${content}\n<p><a href="#${footnote.firstReferenceId}" class="footnote-backref icon-[mdi--arrow-left-bottom]" aria-label="Back to content"></a></p>\n</li>`;
		}),
	);
	return `<section class="footnotes">\n<hr>\n<ol>\n${items.join('\n')}\n</ol>\n</section>`;
}

if (import.meta.vitest != null) {
	describe('extractFootnotes', () => {
		it('extracts definitions without touching fenced code', () => {
			const result = extractFootnotes('text[^note]\n\n```md\n[^code]: no\n```\n\n[^note]: body');

			expect(result.footnotes).toHaveLength(1);
			expect(result.footnotes[0]).toMatchObject({ content: 'body', id: 'note', key: 'note' });
			expect(result.content).toContain('```md\n[^code]: no\n```');
			expect(result.content).not.toContain('[^note]: body');
		});

		it('replaces references while preserving inline code', () => {
			const result = extractFootnotes('`[^note]` and [^note]\n\n[^note]: body');

			expect(result.content).toContain('`[^note]`');
			expect(result.content).toContain(
				'<sup class="footnote-ref"><a href="#fn-note" id="fnref-note">1</a></sup>',
			);
		});
	});
}
