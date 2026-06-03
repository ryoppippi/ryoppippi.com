import type { JsParserOptions } from '@ox-content/napi';
import { mergeHighlightedCodeBlocks, parseAndRender } from '@ox-content/napi';
import { rendererRich, transformerTwoslash } from '@shikijs/twoslash';
import { codeToHtml } from 'shiki';
import { renderMagicLink } from './magic-link.ts';
import { transformerEscape } from './shiki-transformer.ts';

const oxContentOptions = {
	gfm: true,
	footnotes: true,
	taskLists: true,
	tables: true,
	strikethrough: true,
	autolinks: true,
} as const satisfies JsParserOptions;

type CodeBlock = {
	language: string;
	code: string;
};

type OpenCodeBlock = {
	language: string;
	lines: string[];
};

type FenceLine = {
	marker: string;
	info: string;
};

async function highlightCode(code: string, lang: string) {
	return codeToHtml(code, {
		lang,
		themes: {
			dark: 'kanagawa-dragon',
			light: 'kanagawa-lotus',
		},
		transformers: [
			transformerTwoslash({
				explicitTrigger: true,
				renderer: rendererRich(),
			}),
			transformerEscape(),
		],
	});
}

function escapeHtml(value: string) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function transformOutsideFences(content: string, transform: (line: string) => string) {
	const lines = content.split('\n');
	let inFence = false;
	let fenceMarker = '';

	return lines.map((line) => {
		const trimmed = line.trimStart();
		const fence = trimmed.match(/^(`{3,}|~{3,})/)?.[1];

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

		return inFence ? line : transform(line);
	}).join('\n');
}

function escapeMagicLinkUnderscores(line: string) {
	return line.replace(/\{([^{}\n]+)\}/g, (match, input: string) => {
		if (renderMagicLink(input) == null) {
			return match;
		}

		return match.replace(/_/g, String.raw`\_`);
	});
}

function normalizeAngleUrl(url: string) {
	return url.replace(/\(/g, '%28').replace(/\)/g, '%29');
}

function normalizeAngleLinks(line: string) {
	return line
		.replace(/\[([^\]]+)\]\(<(https?:\/\/[^>\s]+)>\)/g, (_match, label: string, url: string) => `[${label}](${normalizeAngleUrl(url)})`)
		.replace(/<(https?:\/\/[^>\s]+)>/g, (_match, url: string) => `[${url}](${normalizeAngleUrl(url)})`);
}

function prepareOxContentMarkdown(content: string) {
	return transformOutsideFences(
		content,
		line => normalizeAngleLinks(escapeMagicLinkUnderscores(line)).replace(
			/!\[([^\]]*)\]\((\S+)\s+(['"])(.*?)\3\)(?:\{[^}\n]+\})?/g,
			(_match, alt: string, src: string, _quote: string, title: string) => `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" title="${escapeHtml(title)}">`,
		),
	);
}

function resolveCodeBlockLanguage(language: string, languageClass: string | undefined) {
	if (language.length > 0) {
		return language;
	}

	if (languageClass != null && languageClass.length > 0) {
		return languageClass;
	}

	return 'text';
}

function parseFenceLine(line: string): FenceLine | null {
	let indent = 0;
	while (indent < line.length && line[indent] === ' ') {
		indent += 1;
	}

	if (indent > 3) {
		return null;
	}

	const start = line[indent];
	if (start !== '`' && start !== '~') {
		return null;
	}

	let markerLength = 0;
	while (indent + markerLength < line.length && line[indent + markerLength] === start) {
		markerLength += 1;
	}

	if (markerLength < 3) {
		return null;
	}

	return {
		marker: start.repeat(markerLength),
		info: line.slice(indent + markerLength),
	};
}

function extractFencedCodeBlocks(source: string) {
	const codeBlocks: CodeBlock[] = [];
	const lines = source.split('\n');
	let current: OpenCodeBlock | null = null;
	let fenceMarker = '';

	for (const line of lines) {
		if (current == null) {
			const openingFence = parseFenceLine(line);
			if (openingFence == null) {
				continue;
			}

			fenceMarker = openingFence.marker;
			current = {
				language: openingFence.info.trim().split(/\s+/, 1)[0] ?? '',
				lines: [],
			};
			continue;
		}

		const closingFence = parseFenceLine(line);
		if (
			closingFence != null
			&& closingFence.info.trim().length === 0
			&& closingFence.marker[0] === fenceMarker[0]
			&& closingFence.marker.length >= fenceMarker.length
		) {
			codeBlocks.push({
				language: current.language,
				code: current.lines.join('\n'),
			});
			current = null;
			fenceMarker = '';
			continue;
		}

		current.lines.push(line);
	}

	return codeBlocks;
}

async function renderHighlightedCodeBlocks(source: string, html: string) {
	const codeBlocks = extractFencedCodeBlocks(source);
	const codeBlockPattern = /<pre><code(?: class="language-([^"]*)")?>[\s\S]*?<\/code><\/pre>/g;
	const chunks: string[] = [];
	let codeBlockIndex = 0;
	let lastIndex = 0;

	for (const match of html.matchAll(codeBlockPattern)) {
		const [codeBlockHtml, languageClass] = match;
		const index = match.index;
		const codeBlock = codeBlocks[codeBlockIndex];
		codeBlockIndex += 1;

		chunks.push(html.slice(lastIndex, index));

		if (codeBlock == null) {
			chunks.push(codeBlockHtml);
		}
		else {
			chunks.push(await highlightCode(codeBlock.code, resolveCodeBlockLanguage(codeBlock.language, languageClass)));
		}

		lastIndex = index + codeBlockHtml.length;
	}

	chunks.push(html.slice(lastIndex));
	return chunks.join('');
}

export async function renderMarkdown(content: string) {
	const prepared = prepareOxContentMarkdown(content);
	const result = parseAndRender(prepared, oxContentOptions);

	if (result.errors.length > 0) {
		throw new Error(`ox-content failed to render Markdown: ${result.errors.join('\n')}`);
	}

	return mergeHighlightedCodeBlocks(result.html, await renderHighlightedCodeBlocks(prepared, result.html));
}
