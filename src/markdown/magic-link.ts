export type MagicLink = {
	link: string;
	imageUrl: string;
};

export const magicLinks = {
	'vim-jp': { link: 'https://vim-jp.org/', imageUrl: 'https://vim-jp.org/assets/images/vim2-128.png' },
	'vim-jp-radio': { link: 'https://vim-jp-radio.com/', imageUrl: 'https://cdn.jsdelivr.net/gh/vim-jp-radio/LP@main/src/assets/vimjp-radio-cover-art/800x800-fs8.png' },
	'Svelte Japan': { link: 'https://svelte.jp', imageUrl: 'https://cdn.jsdelivr.net/gh/sveltejs/branding/svelte-logo-square.png' },
	'ryoppippi.com': { link: 'https://ryoppippi.com', imageUrl: 'https://ryoppippi.com/ryoppippi.jpg' },
	'tech_world18': { link: 'https://x.com/tech_world18', imageUrl: 'https://pbs.twimg.com/profile_images/1717677089154088960/tDuRN0aB_400x400.jpg' },
	'TECH WORLD': { link: 'https://www.youtube.com/channel/UCISDrqLMNq3w9AZ4otdoRuA', imageUrl: 'https://pbs.twimg.com/profile_images/1920681519682908160/0sY6R8FJ_400x400.jpg' },
	'eerm16g': { link: 'https://x.com/eerm16g', imageUrl: 'https://pbs.twimg.com/profile_images/1959591256381927424/ULcgBpZx_400x400.jpg' },
} as const satisfies Record<string, MagicLink>;

function escapeHtml(value: string) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function renderLink(href: string, imageUrl: string, label: string, kind: 'github-at' | 'link') {
	const className = `markdown-magic-link markdown-magic-link-${kind}`;
	return `<a href="${escapeHtml(href)}" class="${className}" target="_blank" rel="noopener"><span class="markdown-magic-link-image" style="background-image: url('${escapeHtml(imageUrl)}');"></span>${escapeHtml(label)}</a>`;
}

export function renderMagicLink(input: string) {
	const normalized = input.trim();
	const [username, label, href, ...extra] = normalized.startsWith('@')
		? normalized.slice(1).split('|').map(part => part.trim())
		: [];

	if (username != null && extra.length === 0 && /^[a-z\d][a-z\d-]*$/i.test(username)) {
		return renderLink(
			href?.length ? href : `https://github.com/${username}`,
			`https://github.com/${username}.png`,
			label?.length ? label : username.toUpperCase(),
			'github-at',
		);
	}

	const configured = magicLinks[normalized as keyof typeof magicLinks];
	if (configured == null) {
		return null;
	}

	return renderLink(configured.link, configured.imageUrl, normalized, 'link');
}

export function replaceMagicLinks(html: string) {
	return html.replace(/\{([^{}\n]+)\}/g, (match, input: string) => renderMagicLink(input) ?? match);
}
