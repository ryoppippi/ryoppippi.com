import type { IslandModules } from './component-islands.ts';
import { transformOutsideFences } from './fences.ts';

/** A component a post pulls in with an import statement. */
export type IslandImport = {
	/** Name the component is bound to, used as the tag name in the body. */
	name: string;
	/** Specifier as written, relative to the post's own file. */
	specifier: string;
};

// Deliberately narrower than JavaScript: a default import of a relative
// `.svelte` path, bound to a capitalised name so it can be used as a tag.
const IMPORT_PATTERN =
	/^import\s+([A-Z][A-Za-z0-9]*)\s+from\s+(['"])(\.{1,2}\/[^'"]*\.svelte)\2\s*;?\s*$/;

/**
 * Reads the component imports a post declares.
 *
 * Anything that is not a default import of a relative `.svelte` path is
 * ignored, so an unsupported import stays in the document where the author can
 * see it rather than disappearing silently.
 *
 * @param content - Markdown body, frontmatter already removed.
 * @returns One entry per import, in the order they appear.
 * @example
 * parseIslandImports("import Chart from './Chart.svelte'");
 * // [{ name: 'Chart', specifier: './Chart.svelte' }]
 */
export function parseIslandImports(content: string): IslandImport[] {
	const imports: IslandImport[] = [];

	transformOutsideFences(content, (line) => {
		const match = line.match(IMPORT_PATTERN);
		if (match != null) {
			imports.push({ name: match[1], specifier: match[3] });
		}

		return line;
	});

	return imports;
}

/**
 * Removes the import statements that were resolved to a component.
 *
 * An import that resolved to nothing is left in place: the author sees the line
 * in the rendered post and can tell the path is wrong, which matches how an
 * unknown component tag stays visible.
 *
 * @param content - Markdown body.
 * @param islands - Components that resolved, keyed by bound name.
 * @returns The markdown with the resolved imports blanked out.
 * @example
 * stripIslandImports("import Chart from './Chart.svelte'\n", { Chart: 'post/Chart.svelte' });
 * // '\n'
 */
export function stripIslandImports(content: string, islands: IslandModules): string {
	return transformOutsideFences(content, (line) => {
		const name = line.match(IMPORT_PATTERN)?.[1];
		// Blanked rather than dropped so the line count is stable and the
		// paragraph that follows keeps its separating blank line.
		return name != null && islands[name] != null ? '' : line;
	});
}

if (import.meta.vitest != null) {
	describe(parseIslandImports, () => {
		it('reads a default import of a relative component', () => {
			expect(parseIslandImports("import Chart from './Chart.svelte'")).toEqual([
				{ name: 'Chart', specifier: './Chart.svelte' },
			]);
		});

		it('reads a component from a subdirectory', () => {
			expect(parseIslandImports('import Chart from "./gtv-chart/GtvChart.svelte";')).toEqual([
				{ name: 'Chart', specifier: './gtv-chart/GtvChart.svelte' },
			]);
		});

		it('reads a component from a sibling post directory', () => {
			expect(
				parseIslandImports("import Chart from '../2026-07-30-uk-gtv-ja/gtv-chart/GtvChart.svelte'"),
			).toEqual([
				{
					name: 'Chart',
					specifier: '../2026-07-30-uk-gtv-ja/gtv-chart/GtvChart.svelte',
				},
			]);
		});

		it('reads several imports in order', () => {
			const content = "import B from './B.svelte'\nimport A from './A.svelte'";

			expect(parseIslandImports(content).map((entry) => entry.name)).toEqual(['B', 'A']);
		});

		it('ignores an import inside a code fence', () => {
			const content = "```md\nimport Chart from './Chart.svelte'\n```";

			expect(parseIslandImports(content)).toEqual([]);
		});

		it('ignores a lowercase binding, which cannot be a tag', () => {
			expect(parseIslandImports("import chart from './Chart.svelte'")).toEqual([]);
		});

		it('ignores a bare specifier', () => {
			expect(parseIslandImports("import Chart from 'some-package/Chart.svelte'")).toEqual([]);
		});

		it('ignores an import of something other than a component', () => {
			expect(parseIslandImports("import { rows } from './rows.ts'")).toEqual([]);
		});

		it('ignores a line that only mentions an import', () => {
			expect(parseIslandImports("Write `import Chart from './Chart.svelte'` to use it.")).toEqual(
				[],
			);
		});
	});

	describe(stripIslandImports, () => {
		it('blanks an import that resolved', () => {
			const content = "import Chart from './Chart.svelte'\n\n<Chart />";

			expect(stripIslandImports(content, { Chart: 'post/Chart.svelte' })).toBe('\n\n<Chart />');
		});

		it('keeps an import that resolved to nothing', () => {
			const content = "import Chart from './Missing.svelte'";

			expect(stripIslandImports(content, {})).toBe(content);
		});

		it('keeps an import inside a code fence', () => {
			const content = "```md\nimport Chart from './Chart.svelte'\n```";

			expect(stripIslandImports(content, { Chart: 'post/Chart.svelte' })).toBe(content);
		});
	});
}
