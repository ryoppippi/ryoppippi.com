export function escapeHtml(value: string) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

export function addExternalLinkAttributes(html: string) {
	return html.replace(/<a href="(https?:\/\/[^"]*)"([^>]*)>/g, (match, href: string, attrs: string) => {
		if (/\s(?:target|rel)=/.test(attrs)) {
			return match;
		}

		return `<a href="${href}"${attrs} target="_blank" rel="noopener">`;
	});
}
