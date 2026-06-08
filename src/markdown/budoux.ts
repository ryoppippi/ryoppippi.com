import { loadDefaultJapaneseParser } from 'budoux';

const paragraphWordBreakStyle = 'word-break:keep-all;overflow-wrap:anywhere;';
const zeroWidthSpace = '\u200B';
const skippedTextTags = new Set(['code', 'pre', 'script', 'style']);
const japaneseParser = loadDefaultJapaneseParser();

function applyParagraphStyle(tag: string) {
	return tag.replace(/^<p(\s[^>]*)?>$/i, (match, attrs: string | undefined) => {
		if (attrs == null) {
			return `<p style="${paragraphWordBreakStyle}">`;
		}

		const styleMatch = attrs.match(/\sstyle=(["'])(.*?)\1/i);
		if (styleMatch == null) {
			return `<p${attrs} style="${paragraphWordBreakStyle}">`;
		}

		const separator = styleMatch[2].endsWith(';') ? '' : ';';
		const style = `${styleMatch[2]}${separator}${paragraphWordBreakStyle}`;
		return `<p${attrs.replace(styleMatch[0], ` style=${styleMatch[1]}${style}${styleMatch[1]}`)}>`;
	});
}

function segmentText(text: string) {
	if (text.trim().length === 0) {
		return text;
	}

	return text
		.split(/(&(?:#\d+|#x[\da-f]+|[a-z][a-z\d]+);)/i)
		.map((chunk, index) => index % 2 === 1 ? chunk : japaneseParser.parse(chunk).join(zeroWidthSpace))
		.join('');
}

export function applyBudouxHtml(html: string) {
	const chunks: string[] = [];
	const tagPattern = /<!--[\s\S]*?-->|<\/?([a-z][\w:-]*)\b[^>]*>/gi;
	const skipStack: string[] = [];
	let lastIndex = 0;

	for (const match of html.matchAll(tagPattern)) {
		const [tag, tagName] = match;
		const index = match.index;
		const text = html.slice(lastIndex, index);
		chunks.push(skipStack.length > 0 ? text : segmentText(text));

		const normalizedTagName = tagName?.toLowerCase();
		if (normalizedTagName === 'p' && /^<p(?:\s|>)/i.test(tag)) {
			chunks.push(applyParagraphStyle(tag));
		}
		else {
			chunks.push(tag);
		}

		if (normalizedTagName != null && skippedTextTags.has(normalizedTagName)) {
			if (tag.startsWith('</')) {
				const stackIndex = skipStack.lastIndexOf(normalizedTagName);
				if (stackIndex >= 0) {
					skipStack.splice(stackIndex, 1);
				}
			}
			else if (!tag.endsWith('/>')) {
				skipStack.push(normalizedTagName);
			}
		}

		lastIndex = index + tag.length;
	}

	const tail = html.slice(lastIndex);
	chunks.push(skipStack.length > 0 ? tail : segmentText(tail));
	return chunks.join('');
}

if (import.meta.vitest != null) {
	describe('applyBudouxHtml', () => {
		it('adds paragraph line-break style and zero-width spaces to Japanese text', () => {
			expect(applyBudouxHtml('<p>今日は天気です。</p>')).toBe(
				`<p style="${paragraphWordBreakStyle}">今日は${zeroWidthSpace}天気です。</p>`,
			);
		});

		it('preserves existing paragraph style attributes', () => {
			expect(applyBudouxHtml('<p style="color:red">今日は天気です。</p>')).toBe(
				`<p style="color:red;${paragraphWordBreakStyle}">今日は${zeroWidthSpace}天気です。</p>`,
			);
		});

		it('does not segment code block contents', () => {
			expect(applyBudouxHtml('<p>今日は天気です。</p><pre><code>今日は天気です。</code></pre>')).toContain(
				'<pre><code>今日は天気です。</code></pre>',
			);
		});

		it('preserves html entities while segmenting text', () => {
			const html = applyBudouxHtml('<p>今日は&amp;天気です。</p>');

			expect(html).toContain('&amp;');
			expect(html).not.toContain(`&${zeroWidthSpace}amp;`);
		});
	});
}
