import badgeDarkSource from './not-by-ai/badge-dark.svg?raw';
import badgeLightSource from './not-by-ai/badge-light.svg?raw';

// Placeholder emitted at the markdown stage so the badge SVG markup never goes
// through ox-content parsing, linkification, or magic-link replacement.
const PLACEHOLDER = '<span data-not-by-ai-placeholder></span>';

// ox-content may reflow the placeholder across lines (e.g. inside callout
// blockquotes), and parse5 re-serialisation during the OGP transform
// normalises the bare attribute to `=""`, so the html-stage replacement
// tolerates both forms.
const PLACEHOLDER_PATTERN = /<span data-not-by-ai-placeholder(?:="")?>\s*<\/span>/g;

const BADGE_LABEL = 'Written by human, not by AI';

function inlineSvg(source: string, variant: 'dark' | 'light'): string {
	// The badge SVG sources keep one tag per line, so joining lines produces a
	// single-line fragment that survives HTML post-processing regexes intact.
	const collapsed = source.trim().replace(/\s*\n\s*/g, '');
	return collapsed.replace(
		'<svg ',
		`<svg class="not-by-ai-badge not-by-ai-badge--${variant}" aria-hidden="true" `,
	);
}

// href must be the first attribute so addExternalLinkAttributes recognises the
// anchor and appends target/rel during post-processing.
const badgeHtml = `<a href="https://notbyai.fyi" class="not-by-ai" aria-label="${BADGE_LABEL}">${inlineSvg(badgeLightSource, 'light')}${inlineSvg(badgeDarkSource, 'dark')}</a>`;

/**
 * Replaces `<NotByAI />` component tags in a markdown line with an inert
 * placeholder span that is swapped for the badge markup after rendering.
 *
 * @param line - A single markdown line outside fenced code blocks.
 * @returns The line with `<NotByAI />` tags replaced by placeholder spans.
 * @example
 * replaceNotByAIEmbeds('<NotByAI />'); // '<span data-not-by-ai-placeholder></span>'
 */
export function replaceNotByAIEmbeds(line: string): string {
	return line.replace(/<NotByAI\s*\/>/g, PLACEHOLDER);
}

/**
 * Replaces "not by AI" placeholders in rendered HTML with the badge markup:
 * a link to notbyai.fyi wrapping inline light and dark SVG variants that are
 * toggled by the site's colour-scheme CSS.
 *
 * @param html - Rendered HTML that may contain placeholder spans.
 * @returns The HTML with placeholders replaced by the badge anchor.
 */
export function renderNotByAIBadges(html: string): string {
	return html.replace(PLACEHOLDER_PATTERN, badgeHtml);
}

if (import.meta.vitest != null) {
	describe(replaceNotByAIEmbeds, () => {
		it('replaces the component tag with a placeholder span', () => {
			expect(replaceNotByAIEmbeds('<NotByAI />')).toBe(PLACEHOLDER);
			expect(replaceNotByAIEmbeds('<NotByAI/>')).toBe(PLACEHOLDER);
		});

		it('leaves unrelated lines untouched', () => {
			expect(replaceNotByAIEmbeds('plain text')).toBe('plain text');
		});
	});

	describe(renderNotByAIBadges, () => {
		it('renders both badge variants inside a notbyai.fyi link', () => {
			const html = renderNotByAIBadges('<p><span data-not-by-ai-placeholder>\n</span></p>');

			expect(html).toContain('<a href="https://notbyai.fyi" class="not-by-ai"');
			expect(html).toContain('class="not-by-ai-badge not-by-ai-badge--light"');
			expect(html).toContain('class="not-by-ai-badge not-by-ai-badge--dark"');
			expect(html).not.toContain('data-not-by-ai-placeholder');
		});

		it('replaces placeholders normalised by parse5 serialisation', () => {
			const html = renderNotByAIBadges('<span data-not-by-ai-placeholder=""></span>');

			expect(html).toContain('href="https://notbyai.fyi"');
			expect(html).not.toContain('data-not-by-ai-placeholder');
		});

		it('emits single-line SVG markup', () => {
			expect(renderNotByAIBadges(PLACEHOLDER)).not.toContain('\n');
		});
	});
}
