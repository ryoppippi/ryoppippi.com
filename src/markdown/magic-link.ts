import { escapeHtml } from './html.ts';

export type MagicLink = {
	link: string;
	imageUrl?: string;
};

export type MagicLinkOptions = {
	linksMap?: Record<string, string | MagicLink>;
	imageOverrides?: [RegExp | string, string][];
};

export const magicLinks = {
	'vim-jp': {
		link: 'https://vim-jp.org/',
		imageUrl: 'https://vim-jp.org/assets/images/vim2-128.png',
	},
	'vim-jp-radio': {
		link: 'https://vim-jp-radio.com/',
		imageUrl:
			'https://cdn.jsdelivr.net/gh/vim-jp-radio/LP@main/src/assets/vimjp-radio-cover-art/800x800-fs8.png',
	},
	'Svelte Japan': {
		link: 'https://svelte.jp',
		imageUrl: 'https://cdn.jsdelivr.net/gh/sveltejs/branding/svelte-logo-square.png',
	},
	'ryoppippi.com': {
		link: 'https://ryoppippi.com',
		imageUrl: 'https://ryoppippi.com/ryoppippi.jpg',
	},
	tech_world18: {
		link: 'https://x.com/tech_world18',
		imageUrl: 'https://pbs.twimg.com/profile_images/1717677089154088960/tDuRN0aB_400x400.jpg',
	},
	'TECH WORLD': {
		link: 'https://www.youtube.com/channel/UCISDrqLMNq3w9AZ4otdoRuA',
		imageUrl: 'https://pbs.twimg.com/profile_images/1920681519682908160/0sY6R8FJ_400x400.jpg',
	},
	eerm16g: {
		link: 'https://x.com/eerm16g',
		imageUrl: 'https://pbs.twimg.com/profile_images/1959591256381927424/ULcgBpZx_400x400.jpg',
	},
} as const satisfies Record<string, Required<MagicLink>>;

const githubSpecialRoutes = [
	'settings',
	'pulls',
	'issues',
	'discussions',
	'sponsor',
	'sponsors',
	'notifications',
];

const githubScopePattern = /^(?:https?:\/\/)?github\.com\/([\w-]+)(?:$|[/?#])/;

function isSafeHref(href: string) {
	try {
		const url = new URL(href);
		return url.protocol === 'https:' || url.protocol === 'http:';
	} catch {
		return false;
	}
}

function getFaviconUrl(href: string) {
	return `https://favicon.yandex.net/favicon/${new URL(href).hostname}`;
}

function matchesImageOverride(matcher: RegExp | string, href: string) {
	if (typeof matcher === 'string') {
		return href === matcher;
	}

	matcher.lastIndex = 0;
	const matched = matcher.test(href);
	matcher.lastIndex = 0;
	return matched;
}

function getImageUrl(href: string, imageUrl: string | undefined, options: MagicLinkOptions) {
	let resolvedImageUrl = imageUrl ?? getFaviconUrl(href);
	const githubScope = href.match(githubScopePattern);
	if (githubScope != null && imageUrl == null) {
		const login = githubScope[1];
		if (!githubSpecialRoutes.includes(login)) {
			resolvedImageUrl = `https://github.com/${login}.png`;
		}
	}

	for (const [matcher, override] of options.imageOverrides ?? []) {
		if (matchesImageOverride(matcher, href)) {
			return override;
		}
	}

	return resolvedImageUrl;
}

function renderLink(
	href: string,
	imageUrl: string | undefined,
	label: string,
	kind: 'github-at' | 'link',
	options: MagicLinkOptions,
) {
	const resolvedImageUrl = getImageUrl(href, imageUrl, options);
	if (!isSafeHref(href) || !isSafeHref(resolvedImageUrl)) {
		return null;
	}

	const className = `markdown-magic-link markdown-magic-link-${kind}`;
	return `<a href="${escapeHtml(href)}" class="${className}"><span class="markdown-magic-link-image" style="background-image: url('${escapeHtml(resolvedImageUrl)}');"></span>${escapeHtml(label)}</a>`;
}

function getConfiguredLink(input: string, options: MagicLinkOptions) {
	const configured = options.linksMap?.[input];
	if (typeof configured === 'string') {
		return { link: configured };
	}

	return configured;
}

export function renderMagicLink(
	input: string,
	options: MagicLinkOptions = { linksMap: magicLinks },
) {
	const normalized = input.trim();
	const [username, label, href, ...extra] = normalized.startsWith('@')
		? normalized
				.slice(1)
				.split('|')
				.map((part) => part.trim())
		: [];

	if (username != null && extra.length === 0 && /^[a-z\d][a-z\d-]*$/i.test(username)) {
		return renderLink(
			href?.length ? href : `https://github.com/${username}`,
			undefined,
			label?.length ? label : username.toUpperCase(),
			'github-at',
			options,
		);
	}

	const [text, explicitHref, ...linkExtra] = normalized.split('|').map((part) => part.trim());
	if (linkExtra.length > 0 || text == null) {
		return null;
	}

	const configured = getConfiguredLink(text, options);
	const link = explicitHref?.length ? explicitHref : (configured?.link ?? text);
	if (!isSafeHref(link)) {
		return null;
	}

	return renderLink(
		link,
		configured?.imageUrl,
		text.length > 0 ? text : link.replace(/^https?:\/\//i, ''),
		'link',
		options,
	);
}

export function replaceMagicLinks(
	html: string,
	options: MagicLinkOptions = { linksMap: magicLinks },
) {
	return html.replace(/\{([^{}\n]+)\}/g, (match, input: string) => {
		const rendered = renderMagicLink(input, options);
		return rendered ?? match;
	});
}

if (import.meta.vitest != null) {
	describe('renderMagicLink', () => {
		it('renders a GitHub user shorthand with an avatar', () => {
			expect(renderMagicLink('@ryoppippi')).toBe(
				'<a href="https://github.com/ryoppippi" class="markdown-magic-link markdown-magic-link-github-at"><span class="markdown-magic-link-image" style="background-image: url(\'https://github.com/ryoppippi.png\');"></span>RYOPPIPPI</a>',
			);
		});

		it.each([
			[
				'@antfu',
				'<a href="https://github.com/antfu" class="markdown-magic-link markdown-magic-link-github-at"><span class="markdown-magic-link-image" style="background-image: url(\'https://github.com/antfu.png\');"></span>ANTFU</a>',
			],
			[
				'@antfu|Anthony',
				'<a href="https://github.com/antfu" class="markdown-magic-link markdown-magic-link-github-at"><span class="markdown-magic-link-image" style="background-image: url(\'https://github.com/antfu.png\');"></span>Anthony</a>',
			],
			[
				'@antfu|Anthony|https://github.com/antfu?tab=sponsoring',
				'<a href="https://github.com/antfu?tab=sponsoring" class="markdown-magic-link markdown-magic-link-github-at"><span class="markdown-magic-link-image" style="background-image: url(\'https://github.com/antfu.png\');"></span>Anthony</a>',
			],
		])('matches markdown-it-magic-link GitHub fixture for {%s}', (input, expected) => {
			expect(renderMagicLink(input)).toBe(expected);
		});

		it.each([
			[
				'VueUse|https://vueuse.org',
				'<a href="https://vueuse.org" class="markdown-magic-link markdown-magic-link-link"><span class="markdown-magic-link-image" style="background-image: url(\'https://favicon.yandex.net/favicon/vueuse.org\');"></span>VueUse</a>',
			],
			[
				'VueUse',
				'<a href="https://vueuse.org/1" class="markdown-magic-link markdown-magic-link-link"><span class="markdown-magic-link-image" style="background-image: url(\'https://favicon.yandex.net/favicon/vueuse.org\');"></span>VueUse</a>',
			],
			[
				'Vue Use ',
				'<a href="https://vueuse.org/2" class="markdown-magic-link markdown-magic-link-link"><span class="markdown-magic-link-image" style="background-image: url(\'https://favicon.yandex.net/favicon/vueuse.org\');"></span>Vue Use</a>',
			],
			[
				'VueUse|https://vueuse.org/3',
				'<a href="https://vueuse.org/3" class="markdown-magic-link markdown-magic-link-link"><span class="markdown-magic-link-image" style="background-image: url(\'https://favicon.yandex.net/favicon/vueuse.org\');"></span>VueUse</a>',
			],
		])('matches markdown-it-magic-link link fixture for {%s}', (input, expected) => {
			expect(
				renderMagicLink(input, {
					linksMap: {
						VueUse: 'https://vueuse.org/1',
						'Vue Use': 'https://vueuse.org/2',
					},
				}),
			).toBe(expected);
		});

		it('matches markdown-it-magic-link links map image fixture', () => {
			expect(
				renderMagicLink('VueUse', {
					linksMap: {
						VueUse: { link: 'https://vueuse.org/1', imageUrl: 'https://example.com/favicon1.png' },
					},
				}),
			).toBe(
				'<a href="https://vueuse.org/1" class="markdown-magic-link markdown-magic-link-link"><span class="markdown-magic-link-image" style="background-image: url(\'https://example.com/favicon1.png\');"></span>VueUse</a>',
			);
		});

		it('matches markdown-it-magic-link image override fixture', () => {
			const options = {
				linksMap: {
					VueUse: 'https://vueuse.org/1',
				},
				imageOverrides: [
					[/^https:\/\/vueuse\.org\/1/, 'https://example.com/favicon1.png'],
					[/^https:\/\/vueuse\.org\//, 'https://example.com/favicon2.png'],
				],
			} satisfies MagicLinkOptions;

			expect(renderMagicLink('VueUse', options)).toBe(
				'<a href="https://vueuse.org/1" class="markdown-magic-link markdown-magic-link-link"><span class="markdown-magic-link-image" style="background-image: url(\'https://example.com/favicon1.png\');"></span>VueUse</a>',
			);
			expect(renderMagicLink('VueUse|https://vueuse.org/anything', options)).toBe(
				'<a href="https://vueuse.org/anything" class="markdown-magic-link markdown-magic-link-link"><span class="markdown-magic-link-image" style="background-image: url(\'https://example.com/favicon2.png\');"></span>VueUse</a>',
			);
		});

		it('renders configured site links with spaces in the label', () => {
			expect(renderMagicLink('Svelte Japan')).toContain('href="https://svelte.jp"');
		});

		it('rejects unsafe custom hrefs', () => {
			expect(renderMagicLink('@ryoppippi|bad|javascript:alert(1)')).toBeNull();
		});

		it('does not use GitHub avatar URLs for reserved GitHub routes', () => {
			const html = renderMagicLink('@issues');

			expect(html).toContain('href="https://github.com/issues"');
			expect(html).toContain(
				"background-image: url('https://favicon.yandex.net/favicon/github.com')",
			);
			expect(html).not.toContain('https://github.com/issues.png');
		});

		it('does not treat GitHub root links as user scopes', () => {
			const html = renderMagicLink('GitHub|https://github.com/?tab=repositories', {});

			expect(html).toContain('href="https://github.com/?tab=repositories"');
			expect(html).toContain(
				"background-image: url('https://favicon.yandex.net/favicon/github.com')",
			);
			expect(html).not.toContain('https://github.com/.png');
		});

		it('matches global regex image overrides consistently across calls', () => {
			const options = {
				linksMap: {
					VueUse: 'https://vueuse.org/1',
				},
				imageOverrides: [[/^https:\/\/vueuse\.org\//g, 'https://example.com/favicon.png']],
			} satisfies MagicLinkOptions;

			const expected =
				'<a href="https://vueuse.org/1" class="markdown-magic-link markdown-magic-link-link"><span class="markdown-magic-link-image" style="background-image: url(\'https://example.com/favicon.png\');"></span>VueUse</a>';

			expect(renderMagicLink('VueUse', options)).toBe(expected);
			expect(renderMagicLink('VueUse', options)).toBe(expected);
		});
	});

	describe('replaceMagicLinks', () => {
		it('matches markdown-it-magic-link basic fixture', () => {
			const html = replaceMagicLinks(
				'Foo {@github} Bar\n\nFoo {VueUse|https://vueuse.org} Bar',
				{},
			);

			expect(html).toBe(
				'Foo <a href="https://github.com/github" class="markdown-magic-link markdown-magic-link-github-at"><span class="markdown-magic-link-image" style="background-image: url(\'https://github.com/github.png\');"></span>GITHUB</a> Bar\n\nFoo <a href="https://vueuse.org" class="markdown-magic-link markdown-magic-link-link"><span class="markdown-magic-link-image" style="background-image: url(\'https://favicon.yandex.net/favicon/vueuse.org\');"></span>VueUse</a> Bar',
			);
		});

		it('leaves unknown labels untouched', () => {
			expect(
				replaceMagicLinks('D {Vueuse} non-target', {
					linksMap: {
						VueUse: 'https://vueuse.org/1',
					},
				}),
			).toBe('D {Vueuse} non-target');
		});

		it('renders magic links before closing parentheses and brackets', () => {
			const html = replaceMagicLinks('({@github}) [{@github}]', {});

			expect(html).toContain('(<a href="https://github.com/github"');
			expect(html).toContain('>) [<a href="https://github.com/github"');
			expect(html).toContain('</a>]');
		});
	});
}
