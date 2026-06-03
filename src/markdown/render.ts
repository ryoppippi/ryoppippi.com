import type { JsParserOptions } from '@ox-content/napi';
import process from 'node:process';
import { parseAndRender } from '@ox-content/napi';
import { renderMagicLink } from './magic-link.ts';
import { md } from './markdown.ts';

const oxContentOptions = {
	gfm: true,
	footnotes: true,
	taskLists: true,
	tables: true,
	strikethrough: true,
	autolinks: true,
} as const satisfies JsParserOptions;

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

export type MarkdownRenderer = 'markdown-it' | 'ox-content';

export function getMarkdownRenderer(): MarkdownRenderer {
	return process.env.OX_CONTENT_MARKDOWN === '0' ? 'markdown-it' : 'ox-content';
}

export async function renderMarkdown(content: string) {
	if (getMarkdownRenderer() === 'ox-content') {
		const result = parseAndRender(prepareOxContentMarkdown(content), oxContentOptions);

		if (result.errors.length > 0) {
			throw new Error(`ox-content failed to render Markdown: ${result.errors.join('\n')}`);
		}

		return result.html;
	}

	return md.renderAsync(content);
}
