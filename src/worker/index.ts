type Env = {
	ASSETS: { fetch: (request: Request) => Promise<Response> };
};

const MARKDOWN = 'text/markdown';

function mediaTypeQuality(accept: string, mediaType: string): number {
	for (const range of accept.split(',')) {
		const [type, ...parameters] = range.split(';').map((part) => part.trim().toLowerCase());
		if (type !== mediaType) continue;
		const quality = parameters.find((parameter) => parameter.startsWith('q='));
		return quality == null ? 1 : Number(quality.slice(2)) || 0;
	}
	return 0;
}

/** Markdown wins only when the client names it and ranks it at least as high as HTML. */
export function prefersMarkdown(accept: string | null): boolean {
	if (accept == null) return false;
	const markdown = mediaTypeQuality(accept, MARKDOWN);
	return markdown > 0 && markdown >= mediaTypeQuality(accept, 'text/html');
}

/** Page URLs end in a slash; their Markdown companion sits beside the directory. */
export function markdownCompanionPath(pathname: string): string | null {
	if (pathname === '/') return '/index.md';
	return pathname.endsWith('/') ? `${pathname.slice(0, -1)}.md` : null;
}

function withHeaders(
	response: Response,
	headers: Record<string, string>,
	status = response.status,
) {
	const next = new Response(response.body, {
		status,
		statusText: status === response.status ? response.statusText : '',
		headers: response.headers,
	});
	for (const [name, value] of Object.entries(headers)) next.headers.set(name, value);
	next.headers.append('Vary', 'Accept');
	return next;
}

function markdownResponse(response: Response, status: number) {
	return withHeaders(response, { 'Content-Type': `${MARKDOWN}; charset=utf-8` }, status);
}

const worker = {
	async fetch(request: Request, env: Env): Promise<Response> {
		if (!prefersMarkdown(request.headers.get('Accept'))) {
			return withHeaders(await env.ASSETS.fetch(request), {});
		}
		const url = new URL(request.url);
		const companion = markdownCompanionPath(url.pathname);
		if (companion != null) {
			const markdown = await env.ASSETS.fetch(new Request(new URL(companion, url), request));
			if (markdown.ok) return markdownResponse(markdown, 200);
		}
		const asset = await env.ASSETS.fetch(request);
		if (asset.status !== 404) return withHeaders(asset, {});
		const notFound = await env.ASSETS.fetch(new Request(new URL('/404.md', url), request));
		return notFound.ok ? markdownResponse(notFound, 404) : withHeaders(asset, {});
	},
};

export default worker;

if (import.meta.vitest != null) {
	test.each([
		[null, false],
		['text/html,application/xhtml+xml,*/*;q=0.8', false],
		['text/markdown', true],
		['text/markdown, text/html;q=0.9', true],
		['text/html, text/markdown;q=0.5', false],
		['text/markdown;q=0', false],
	])('prefersMarkdown(%j) is %s', (accept, expected) => {
		expect(prefersMarkdown(accept)).toBe(expected);
	});

	test.each([
		['/', '/index.md'],
		['/about/', '/about.md'],
		['/blog/post-en/', '/blog/post-en.md'],
		['/feed.xml', null],
	])('maps %s to %s', (pathname, expected) => {
		expect(markdownCompanionPath(pathname)).toBe(expected);
	});

	const files: Record<string, string> = {
		'/': '<h1>home</h1>',
		'/index.md': '# home',
		'/works/oss/': '<h1>oss</h1>',
		'/404.md': '# Page not found',
	};
	const env = {
		ASSETS: {
			fetch: async (request: Request) => {
				const body = files[new URL(request.url).pathname];
				return body == null
					? new Response('<h1>404</h1>', { status: 404 })
					: new Response(body, { headers: { 'Content-Type': 'text/html' } });
			},
		},
	} satisfies Env;
	const get = (pathname: string, accept: string) =>
		worker.fetch(
			new Request(new URL(pathname, 'https://ryoppippi.com'), { headers: { accept } }),
			env,
		);

	test('serves Markdown to agents and HTML to browsers, varying on Accept', async () => {
		const markdown = await get('/', MARKDOWN);
		const html = await get('/', 'text/html');
		expect([markdown.status, markdown.headers.get('Content-Type'), await markdown.text()]).toEqual([
			200,
			'text/markdown; charset=utf-8',
			'# home',
		]);
		expect(await html.text()).toBe('<h1>home</h1>');
		expect([markdown.headers.get('Vary'), html.headers.get('Vary')]).toEqual(['Accept', 'Accept']);
	});

	test('falls back to HTML for pages without a Markdown companion', async () => {
		const response = await get('/works/oss/', MARKDOWN);
		expect([response.status, await response.text()]).toEqual([200, '<h1>oss</h1>']);
	});

	test('answers missing pages with a Markdown 404', async () => {
		const response = await get('/missing/', MARKDOWN);
		expect([response.status, response.headers.get('Content-Type'), await response.text()]).toEqual([
			404,
			'text/markdown; charset=utf-8',
			'# Page not found',
		]);
	});
}
