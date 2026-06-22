import type { Element, Nodes, Root } from 'hast';
import type { ThemeRegistration } from '@ox-content/vite-plugin';
import type { Plugin } from 'vite';
import { oxContent } from '@ox-content/vite-plugin';
import { isDeepStrictEqual } from 'node:util';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import { bundledLanguages } from 'shiki/langs';
import { bundledThemes } from 'shiki/themes';
import { unified } from 'unified';

const lightTheme = 'kanagawa-lotus';
const darkTheme = 'kanagawa-dragon';
const combinedTheme = 'kanagawa-dual';
const additionalLanguageNames = ['zig', 'fish', 'lua', 'vimscript', 'cmake'] as const;

type MarkdownTransform = (code: string, id: string) => Promise<{ code: string } | null | undefined>;

function markdownTransform(plugin: Plugin): MarkdownTransform {
	if (typeof plugin.transform !== 'function') {
		throw new TypeError('Ox Content Markdown transform is unavailable');
	}
	return plugin.transform as MarkdownTransform;
}

function lightDark(light: string, dark: string | undefined): string {
	if (dark == null || light === dark) {
		return light;
	}
	return `light-dark(${light}, ${dark})`;
}

async function createCombinedTheme(): Promise<ThemeRegistration> {
	const [lightModule, darkModule] = await Promise.all([
		bundledThemes[lightTheme](),
		bundledThemes[darkTheme](),
	]);
	const light = lightModule.default;
	const dark = darkModule.default;
	const lightColors = light.colors ?? {};
	const darkColors = dark.colors ?? {};
	const lightTokens = light.tokenColors ?? [];
	const darkTokens = dark.tokenColors ?? [];
	if (
		lightTokens.length !== darkTokens.length ||
		!lightTokens.every((token, index) => isDeepStrictEqual(token.scope, darkTokens[index]?.scope))
	) {
		throw new Error('Kanagawa light and dark themes have incompatible token scopes');
	}
	return {
		...light,
		name: combinedTheme,
		colors: Object.fromEntries(
			Object.entries(lightColors).map(([key, value]) => [key, lightDark(value, darkColors[key])]),
		),
		tokenColors: lightTokens.map((token, index) => ({
			...token,
			settings: {
				...token.settings,
				...(token.settings.background == null
					? {}
					: {
							background: lightDark(
								token.settings.background,
								darkTokens[index].settings.background,
							),
						}),
				...(token.settings.foreground == null
					? {}
					: {
							foreground: lightDark(
								token.settings.foreground,
								darkTokens[index].settings.foreground,
							),
						}),
			},
		})),
	} satisfies ThemeRegistration;
}

async function createMarkdownTransform(highlight: boolean): Promise<MarkdownTransform> {
	const theme = highlight ? await createCombinedTheme() : combinedTheme;
	const highlightLangs = (
		highlight
			? await Promise.all(
					additionalLanguageNames.map(
						async (language) => (await bundledLanguages[language]()).default,
					),
				)
			: []
	).flat();
	const plugin = oxContent({
		embeds: false,
		frontmatter: false,
		highlight,
		highlightLangs,
		highlightTheme: theme,
		ogViewer: false,
		search: false,
		ssg: false,
		toc: false,
	})[0];
	return markdownTransform(plugin);
}

const transforms = Promise.all([createMarkdownTransform(false), createMarkdownTransform(true)]);

async function transformWithTheme(transform: MarkdownTransform, content: string): Promise<string> {
	const result = await transform(content, '/virtual/article.md');
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

function classNames(element: Element): string[] {
	const value = element.properties.className;
	if (Array.isArray(value)) {
		return value.filter((entry): entry is string => typeof entry === 'string');
	}
	return typeof value === 'string' ? value.split(/\s+/) : [];
}

function shikiBlocks(tree: Root): Element[] {
	const blocks: Element[] = [];
	const visit = (node: Nodes) => {
		if (node.type === 'element') {
			if (node.tagName === 'pre' && classNames(node).includes('shiki')) {
				blocks.push(node);
			}
			for (const child of node.children) {
				visit(child);
			}
		} else if (node.type === 'root') {
			for (const child of node.children) {
				visit(child);
			}
		}
	};
	visit(tree);
	return blocks;
}

function normaliseHighlightedHtml(html: string): string {
	const parser = unified().use(rehypeParse, { fragment: true });
	const tree = parser.parse(html) as Root;
	for (const block of shikiBlocks(tree)) {
		block.properties.className = ['shiki', 'shiki-themes', lightTheme, darkTheme];
		delete block.properties.tabIndex;
	}
	return unified().use(rehypeStringify).stringify(tree);
}

export async function renderHighlightedMarkdown(content: string): Promise<string> {
	const hasCodeFence = /^ {0,3}(?:`{3,}|~{3,})/m.test(content);
	const [plainTransform, highlightedTransform] = await transforms;
	const html = await transformWithTheme(
		hasCodeFence ? highlightedTransform : plainTransform,
		content,
	);
	return hasCodeFence ? normaliseHighlightedHtml(html) : html;
}

if (import.meta.vitest != null) {
	describe(renderHighlightedMarkdown, () => {
		it('combines Ox Content light and dark Shiki colors', async () => {
			const html = await renderHighlightedMarkdown('```zig\nconst answer = 42;\n```');

			expect(html).toContain('class="shiki shiki-themes kanagawa-lotus kanagawa-dragon"');
			expect(html).toContain('light-dark(');
			expect(html).toContain('data-language="zig"');
			expect(html).not.toContain('tabindex="0"');
		});
	});
}
