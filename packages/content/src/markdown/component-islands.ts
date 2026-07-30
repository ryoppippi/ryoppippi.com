import { escapeHtml } from './html.ts';

/**
 * Map from a component name usable in markdown to the module that provides it,
 * expressed relative to the blog source directory.
 *
 * @example
 * { GtvChart: '2026-07-23-uk-gtv-ja/GtvChart.svelte' }
 */
export type IslandModules = Record<string, string>;

/** Props parsed off a component tag in markdown. */
export type IslandProps = Record<string, unknown>;

const NAME_PATTERN = /^[A-Z][A-Za-z0-9]*$/;

/**
 * Parses a `{...}` prop expression the way ox-content does: as JSON when it
 * parses, and as the raw text otherwise so typos stay visible instead of
 * throwing during a build.
 */
function parseExpression(expression: string): unknown {
	if (expression.length === 0) {
		return true;
	}

	try {
		return JSON.parse(expression);
	} catch {
		return expression;
	}
}

/**
 * Finds the index just past the `}` that closes the `{` at `start`.
 *
 * Braces are counted rather than matched with a regex so nested objects such
 * as `{ {"a": 1} }` survive, and quoted sections are skipped so a brace inside
 * a JSON string cannot end the expression early.
 */
function findExpressionEnd(raw: string, start: number): number {
	let depth = 0;
	let quote: string | null = null;

	for (let index = start; index < raw.length; index++) {
		const character = raw[index];

		if (quote != null) {
			// Skip the character after a backslash so an escaped quote does not
			// close the string.
			if (character === '\\') {
				index++;
			} else if (character === quote) {
				quote = null;
			}
			continue;
		}

		if (character === '"' || character === "'") {
			quote = character;
		} else if (character === '{') {
			depth++;
		} else if (character === '}') {
			depth--;
			if (depth === 0) {
				return index + 1;
			}
		}
	}

	return raw.length;
}

/**
 * Parses the attribute section of a component tag into props.
 *
 * Mirrors the ox-content prop syntax: `prop="text"` is a string, `prop={42}`
 * is JSON, and a bare `prop` is boolean true.
 *
 * @param raw - Everything between the component name and the closing `/>`.
 * @returns The parsed props, keyed by attribute name.
 * @example
 * parseIslandProps(' title="Hi" count={2} flag'); // { title: 'Hi', count: 2, flag: true }
 */
export function parseIslandProps(raw: string): IslandProps {
	const props: IslandProps = {};
	let index = 0;

	while (index < raw.length) {
		// Attributes are whitespace separated; skip over any run of it.
		if (/\s/.test(raw[index])) {
			index++;
			continue;
		}

		// Read the attribute name.
		const nameStart = index;
		while (index < raw.length && /[\w-]/.test(raw[index])) {
			index++;
		}

		const name = raw.slice(nameStart, index);
		if (name.length === 0) {
			// Not a name character and not whitespace, so nothing here can be
			// parsed; step over it rather than looping forever.
			index++;
			continue;
		}

		if (raw[index] !== '=') {
			props[name] = true;
			continue;
		}

		index++;
		const character = raw[index];

		if (character === '"' || character === "'") {
			const end = raw.indexOf(character, index + 1);
			const valueEnd = end === -1 ? raw.length : end;
			props[name] = raw.slice(index + 1, valueEnd);
			index = valueEnd + 1;
			continue;
		}

		if (character === '{') {
			const end = findExpressionEnd(raw, index);
			props[name] = parseExpression(raw.slice(index + 1, end - 1).trim());
			index = end;
			continue;
		}

		// Unquoted values are not part of the syntax, so treat the run up to the
		// next whitespace as a string.
		const valueStart = index;
		while (index < raw.length && !/\s/.test(raw[index])) {
			index++;
		}
		props[name] = raw.slice(valueStart, index);
	}

	return props;
}

function escapeForPattern(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

/**
 * Replaces self-closing component tags with island placeholders.
 *
 * Only names present in `modules` are rewritten, so unknown uppercase tags and
 * ordinary HTML are left exactly as the author wrote them. The placeholder
 * carries the module id and props for the client to mount.
 *
 * @param line - A single markdown line outside fenced code blocks.
 * @param modules - Component names mapped to their module ids.
 * @returns The line with known component tags replaced by placeholder divs.
 * @example
 * replaceComponentIslands('<GtvChart />', { GtvChart: 'post/GtvChart.svelte' });
 * // '<div data-ox-island="post/GtvChart.svelte"></div>'
 */
export function replaceComponentIslands(line: string, modules: IslandModules): string {
	const names = Object.keys(modules).filter((name) => NAME_PATTERN.test(name));
	if (names.length === 0) {
		return line;
	}

	const pattern = new RegExp(
		`<(${names.map(escapeForPattern).join('|')})((?:\\s[^>]*?)?)\\s*/>`,
		'g',
	);

	return line.replace(pattern, (_match, name: string, rawProps: string) => {
		const props = parseIslandProps(rawProps);
		const attributes = [`data-ox-island="${escapeHtml(modules[name])}"`];

		if (Object.keys(props).length > 0) {
			attributes.push(`data-ox-props="${escapeHtml(JSON.stringify(props))}"`);
		}

		return `<div ${attributes.join(' ')}></div>`;
	});
}

if (import.meta.vitest != null) {
	const modules = { GtvChart: 'post/GtvChart.svelte' } satisfies IslandModules;

	describe(parseIslandProps, () => {
		it('reads strings from either quote style', () => {
			expect(parseIslandProps(' a="one" b=\'two\'')).toEqual({ a: 'one', b: 'two' });
		});

		it('reads JSON from brace expressions', () => {
			expect(parseIslandProps(' n={42} flag={true} list={[1,2]}')).toEqual({
				n: 42,
				flag: true,
				list: [1, 2],
			});
		});

		it('keeps nested objects intact', () => {
			expect(parseIslandProps(' data={ {"a": {"b": 1}} }')).toEqual({ data: { a: { b: 1 } } });
		});

		it('ignores braces inside JSON strings', () => {
			expect(parseIslandProps(' label={"}"}')).toEqual({ label: '}' });
		});

		it('treats a bare attribute as true', () => {
			expect(parseIslandProps(' compact')).toEqual({ compact: true });
		});

		it('falls back to raw text for unparsable expressions', () => {
			expect(parseIslandProps(' value={nope}')).toEqual({ value: 'nope' });
		});

		it('returns nothing for an empty attribute section', () => {
			expect(parseIslandProps('')).toEqual({});
		});
	});

	describe(replaceComponentIslands, () => {
		it('replaces a known tag with a placeholder', () => {
			expect(replaceComponentIslands('<GtvChart />', modules)).toBe(
				'<div data-ox-island="post/GtvChart.svelte"></div>',
			);
			expect(replaceComponentIslands('<GtvChart/>', modules)).toBe(
				'<div data-ox-island="post/GtvChart.svelte"></div>',
			);
		});

		it('serialises props onto the placeholder', () => {
			expect(replaceComponentIslands('<GtvChart title="Hi" n={2} />', modules)).toBe(
				'<div data-ox-island="post/GtvChart.svelte" data-ox-props="{&quot;title&quot;:&quot;Hi&quot;,&quot;n&quot;:2}"></div>',
			);
		});

		it('leaves unregistered components alone', () => {
			expect(replaceComponentIslands('<Unknown />', modules)).toBe('<Unknown />');
		});

		it('leaves ordinary html alone', () => {
			expect(replaceComponentIslands('<div />', modules)).toBe('<div />');
		});

		it('is a no-op without registered modules', () => {
			expect(replaceComponentIslands('<GtvChart />', {})).toBe('<GtvChart />');
		});
	});
}
