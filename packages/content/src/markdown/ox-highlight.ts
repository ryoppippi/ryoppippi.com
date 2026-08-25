import type { Plugin } from 'vite';
import { oxContent } from '@ox-content/vite-plugin';

type MarkdownTransform = (code: string, id: string) => Promise<{ code: string } | null | undefined>;

const magicLinkAliases = {
	'vim-jp': {
		href: 'https://vim-jp.org/',
		image: 'https://vim-jp.org/assets/images/vim2-128.png',
	},
	'vim-jp-radio': {
		href: 'https://vim-jp-radio.com/',
		image:
			'https://cdn.jsdelivr.net/gh/vim-jp-radio/LP@main/src/assets/vimjp-radio-cover-art/800x800-fs8.png',
	},
	'Svelte Japan': {
		href: 'https://svelte.jp',
		image: 'https://cdn.jsdelivr.net/gh/sveltejs/branding/svelte-logo-square.png',
	},
	'ryoppippi.com': {
		href: 'https://ryoppippi.com',
		image: 'https://ryoppippi.com/ryoppippi.jpg',
	},
	tech_world18: {
		href: 'https://x.com/tech_world18',
		image: 'https://pbs.twimg.com/profile_images/1717677089154088960/tDuRN0aB_400x400.jpg',
	},
	'TECH WORLD': {
		href: 'https://www.youtube.com/channel/UCISDrqLMNq3w9AZ4otdoRuA',
		image: 'https://pbs.twimg.com/profile_images/1920681519682908160/0sY6R8FJ_400x400.jpg',
	},
	Rork: {
		href: 'https://rork.com/',
		image: 'https://pbs.twimg.com/profile_images/2024413445236600832/nNHMz2Sc_bigger.jpg',
	},
	typia: {
		href: 'https://github.com/samchon/typia',
		image: 'https://github.com/samchon.png',
	},
	NeovimConf: {
		href: 'https://neovimconf.live/',
		image: 'https://github.com/neovim.png',
	},
	eerm16g: {
		href: 'https://x.com/eerm16g',
		image: 'https://pbs.twimg.com/profile_images/1959591256381927424/ULcgBpZx_400x400.jpg',
	},
} as const;

function markdownTransform(plugin: Plugin): MarkdownTransform {
	if (typeof plugin.transform !== 'function') {
		throw new TypeError('Ox Content Markdown transform is unavailable');
	}
	return plugin.transform as MarkdownTransform;
}

function createMarkdownTransform(mdx: boolean) {
	return markdownTransform(
		oxContent({
			embeds: false,
			frontmatter: false,
			headingPermalinks: true,
			highlight: true,
			magicLinks: {
				aliases: magicLinkAliases,
				favicon: { template: 'https://favicon.yandex.net/favicon/{host}' },
			},
			ogViewer: false,
			search: false,
			semanticFootnotes: true,
			ssg: false,
			mdx,
			toc: false,
		})[0],
	);
}

const markdownTransformOnly = createMarkdownTransform(false);
const mdxTransform = createMarkdownTransform(true);

/**
 * Renders Markdown with Ox Content's native tree-sitter syntax highlighting.
 *
 * @param content - Markdown source to render.
 * @param mdx - Whether to parse document-local imports and component islands.
 * @returns Rendered HTML with supported fenced languages highlighted.
 * @example
 * await renderHighlightedMarkdown('```ts\nconst answer = 42;\n```');
 */
export async function renderHighlightedMarkdown(content: string, mdx = false): Promise<string> {
	const transform = mdx ? mdxTransform : markdownTransformOnly;
	const result = await transform(content, `/virtual/article.${mdx ? 'mdx' : 'md'}`);
	if (result == null) {
		throw new Error('Ox Content did not transform Markdown');
	}
	const prefix = 'export const html = ';
	const start = result.code.indexOf(prefix);
	const end = result.code.indexOf(';\n', start + prefix.length);
	if (start === -1 || end === -1) {
		throw new TypeError('Ox Content generated an invalid Markdown module');
	}
	const html: unknown = JSON.parse(result.code.slice(start + prefix.length, end));
	if (typeof html !== 'string') {
		throw new TypeError('Ox Content generated invalid HTML');
	}
	return html;
}

if (import.meta.vitest != null) {
	describe(renderHighlightedMarkdown, () => {
		it('uses Ox Content native highlighting for supported languages', async () => {
			const html = await renderHighlightedMarkdown('```ts\nconst answer = 42;\n```');

			expect(html).toContain('class="ox-highlight css-variables"');
			expect(html).toContain('data-language="ts"');
			expect(html).toContain('--octc-syntax-');
			expect(html).toContain('tabindex="0"');
		});

		it('uses native MDX imports and island payloads when requested', async () => {
			const html = await renderHighlightedMarkdown(
				"import Chart from './Chart.tsx'\n\n<Chart bars={3} />",
				true,
			);

			expect(html).toContain('data-ox-island="Chart"');
			expect(html).toContain('&quot;bars&quot;:3');
			expect(html).not.toContain('import Chart');
		});
	});
}
