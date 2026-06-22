import type { DefaultTreeAdapterMap } from 'parse5';
import { parse } from 'parse5';
import { escapeHtml } from './html.ts';

type HtmlNode = DefaultTreeAdapterMap['node'];
type HtmlElement = DefaultTreeAdapterMap['element'];

type LinkPreviewMetadata = {
	description: string;
	image: string | null;
	siteName: string;
	title: string;
	url: string;
};

const linkPreviewPattern = /\[@preview\]\((https?:\/\/[^)\s]+)\)/g;
const metadata = new Map<string, LinkPreviewMetadata>();
const pendingMetadata = new Map<string, Promise<LinkPreviewMetadata>>();

function isElement(node: HtmlNode): node is HtmlElement {
	return 'tagName' in node;
}

function textContent(node: HtmlNode): string {
	if ('value' in node) {
		return node.value;
	}

	return 'childNodes' in node ? node.childNodes.map(textContent).join('') : '';
}

function attribute(element: HtmlElement, name: string) {
	return element.attrs.find((item) => item.name.toLowerCase() === name)?.value;
}

function visit(node: HtmlNode, visitor: (element: HtmlElement) => void) {
	if (isElement(node)) {
		visitor(node);
	}
	if ('childNodes' in node) {
		for (const child of node.childNodes) {
			visit(child, visitor);
		}
	}
}

function resolveHttpUrl(value: string | undefined, baseUrl: string) {
	if (value == null || value.length === 0) {
		return null;
	}

	try {
		const url = new URL(value, baseUrl);
		return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
	} catch {
		return null;
	}
}

function fallbackMetadata(url: string): LinkPreviewMetadata {
	return {
		description: '',
		image: null,
		siteName: new URL(url).hostname,
		title: url,
		url,
	};
}

function extractLinkPreviewMetadata(html: string, sourceUrl: string): LinkPreviewMetadata {
	const values = new Map<string, string>();
	let title = '';

	visit(parse(html), (element) => {
		if (element.tagName === 'title' && title.length === 0) {
			title = textContent(element).trim();
			return;
		}
		if (element.tagName !== 'meta') {
			return;
		}

		const key = (attribute(element, 'property') ?? attribute(element, 'name'))?.toLowerCase();
		const content = attribute(element, 'content')?.trim();
		if (key != null && content != null && content.length > 0 && !values.has(key)) {
			values.set(key, content);
		}
	});

	const fallback = fallbackMetadata(sourceUrl);
	return {
		description:
			values.get('og:description') ??
			values.get('description') ??
			values.get('twitter:description') ??
			'',
		image: resolveHttpUrl(values.get('og:image') ?? values.get('twitter:image'), sourceUrl),
		siteName: values.get('og:site_name') ?? fallback.siteName,
		title: (values.get('og:title') ?? values.get('twitter:title') ?? title) || fallback.title,
		url: resolveHttpUrl(values.get('og:url'), sourceUrl) ?? sourceUrl,
	};
}

async function fetchLinkPreviewMetadata(url: string) {
	try {
		const response = await fetch(url, {
			headers: {
				accept: 'text/html,application/xhtml+xml',
				'user-agent': 'ryoppippi.com link preview',
			},
			redirect: 'follow',
			signal: AbortSignal.timeout(8_000),
		});
		if (!response.ok) {
			return fallbackMetadata(url);
		}

		const contentLength = Number(response.headers.get('content-length'));
		if (Number.isFinite(contentLength) && contentLength > 4_000_000) {
			return fallbackMetadata(url);
		}

		const responseUrl = response.url.length > 0 ? response.url : url;
		const html = (await response.text()).slice(0, 4_000_000);
		return extractLinkPreviewMetadata(html, responseUrl);
	} catch {
		return fallbackMetadata(url);
	}
}

function loadLinkPreviewMetadata(url: string) {
	const pending = pendingMetadata.get(url);
	if (pending != null) {
		return pending;
	}

	const request = fetchLinkPreviewMetadata(url).then((result) => {
		metadata.set(url, result);
		return result;
	});
	pendingMetadata.set(url, request);
	return request;
}

export async function preloadLinkPreviews(content: string) {
	const urls = new Set([...content.matchAll(linkPreviewPattern)].map((match) => match[1]));
	await Promise.all([...urls].map(loadLinkPreviewMetadata));
}

function renderLinkPreview(url: string) {
	if (!/^https?:\/\//.test(url)) {
		return null;
	}

	try {
		const preview = metadata.get(url) ?? fallbackMetadata(url);
		const escapedUrl = escapeHtml(preview.url);
		const description =
			preview.description.length > 0
				? `<div class="link-preview-widget-description">${escapeHtml(preview.description)}</div>`
				: '';
		const image =
			preview.image == null
				? ''
				: `<a class="link-preview-widget-image" aria-label="${escapeHtml(preview.title)}" href="${escapedUrl}" rel="noopener" style="background-image: url('${escapeHtml(preview.image.replaceAll("'", '%27'))}');" target="_blank"></a>`;
		return `<div class="link-preview-widget"><a href="${escapedUrl}" rel="noopener" target="_blank"><div class="link-preview-widget-title">${escapeHtml(preview.title)}</div>${description}<div class="link-preview-widget-url">${escapeHtml(preview.siteName)}</div></a>${image}</div>`;
	} catch {
		return null;
	}
}

export function replaceLinkPreviews(line: string) {
	return line.replace(linkPreviewPattern, (match, url: string) => renderLinkPreview(url) ?? match);
}

if (import.meta.vitest != null) {
	describe('replaceLinkPreviews', () => {
		it('converts preview links to link card html', () => {
			expect(replaceLinkPreviews('[@preview](https://github.com/junkawa/figma_jp)')).toBe(
				'<div class="link-preview-widget"><a href="https://github.com/junkawa/figma_jp" rel="noopener" target="_blank"><div class="link-preview-widget-title">https://github.com/junkawa/figma_jp</div><div class="link-preview-widget-url">github.com</div></a></div>',
			);
		});

		it('leaves malformed preview links untouched', () => {
			expect(replaceLinkPreviews('[@preview](https://%)')).toBe('[@preview](https://%)');
		});

		it('extracts and renders Open Graph metadata', () => {
			const url = 'https://example.com/post';
			metadata.set(
				url,
				extractLinkPreviewMetadata(
					'<title>Fallback</title><meta property="og:title" content="Post title"><meta property="og:description" content="Post description"><meta property="og:site_name" content="Example"><meta property="og:image" content="/image.png">',
					url,
				),
			);

			const html = replaceLinkPreviews(`[@preview](${url})`);
			expect(html).toContain('>Post title</div>');
			expect(html).toContain('>Post description</div>');
			expect(html).toContain('>Example</div>');
			expect(html).toContain("background-image: url('https://example.com/image.png')");
		});
	});
}
