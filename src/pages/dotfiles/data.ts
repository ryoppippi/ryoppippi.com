/**
 * Raw URL of the README in the ryoppippi/dotfiles repository.
 *
 * The README is not part of this repository, so it is fetched at prerender
 * time and emitted as static `.md` assets.
 */
export const DOTFILES_README_URL =
	'https://raw.githubusercontent.com/ryoppippi/dotfiles/main/README.md';

/**
 * Fetch the raw dotfiles README.
 *
 * @param fetch - The fetch implementation used by the host.
 * @returns The README contents as markdown text.
 * @throws If the request fails (non-2xx response).
 * @example
 * ```ts
 * const readme = await fetchDotfilesReadme(fetch);
 * ```
 */
export async function fetchDotfilesReadme(fetch: typeof globalThis.fetch): Promise<string> {
	const res = await fetch(DOTFILES_README_URL);

	if (!res.ok) {
		throw new Error(`Failed to fetch dotfiles README: ${res.status} ${res.statusText}`);
	}

	return res.text();
}

/**
 * Match an ATX heading line, capturing its `#` run so we know its level.
 * The text group starts with a non-space character so the `\s+` separator
 * cannot overlap with it (avoids super-linear regex backtracking).
 */
const HEADING_PATTERN = /^(#{1,6})\s+(\S.*)$/;

/**
 * Whether a line opens or closes a fenced code block. A fence may be indented
 * because it can live inside a list item.
 */
function isFence(line: string): boolean {
	return line.trimStart().startsWith('```');
}

/**
 * Find the markdown headings of a document, ignoring lines inside fenced code
 * blocks, where `# comment` lines of shell snippets would otherwise look like
 * level-1 headings.
 *
 * @param lines - The document split into lines.
 * @returns Each heading's line index, level and trimmed text, in order.
 */
function findHeadings(lines: string[]): { index: number; level: number; text: string }[] {
	const headings: { index: number; level: number; text: string }[] = [];
	let insideFence = false;

	for (const [index, line] of lines.entries()) {
		if (isFence(line)) {
			insideFence = !insideFence;
			continue;
		}
		if (insideFence) {
			continue;
		}
		const match = HEADING_PATTERN.exec(line);
		if (match != null) {
			headings.push({ index, level: match[1].length, text: match[2].trim() });
		}
	}

	return headings;
}

/**
 * Extract a single markdown section (a heading and its body) by heading text.
 *
 * The section starts at the matched heading and ends just before the next
 * heading of the same or a higher level, so nested sub-headings stay included.
 *
 * @param markdown - The full markdown document.
 * @param heading - The heading text to match (compared trimmed, case-insensitively).
 * @returns The section text including its heading, trimmed of surrounding blank lines.
 * @throws If no heading matches.
 * @example
 * ```ts
 * const install = extractSection(readme, 'Setup');
 * ```
 */
export function extractSection(markdown: string, heading: string): string {
	const lines = markdown.split('\n');
	const target = heading.trim().toLowerCase();
	const headings = findHeadings(lines);

	const start = headings.find((h) => h.text.toLowerCase() === target);
	if (start == null) {
		throw new Error(`Section not found: ${heading}`);
	}

	// The section ends at the next heading at the same or a higher level
	// (smaller or equal `#` count); everything before it belongs to it.
	const end = headings.find((h) => h.index > start.index && h.level <= start.level);

	return lines
		.slice(start.index, end?.index ?? lines.length)
		.join('\n')
		.trim();
}

/**
 * Heading of the install instructions inside the dotfiles README.
 */
const INSTALL_HEADING = 'Setup';

/**
 * Collect the contents of every fenced code block in a block of lines.
 *
 * @param lines - The lines to scan.
 * @returns Each code block's lines, in document order.
 */
function fencedCodeBlocks(lines: string[]): string[][] {
	const blocks: string[][] = [];
	let current: string[] | null = null;

	for (const line of lines) {
		if (isFence(line)) {
			// An opening marker starts collecting; the matching one closes the block.
			if (current == null) {
				current = [];
			} else {
				blocks.push(current);
				current = null;
			}
			continue;
		}
		current?.push(line);
	}

	return blocks;
}

/**
 * Pick the commands for one OS out of a code block.
 *
 * A block whose commands are grouped under `# <OS>` comment lines is
 * platform-specific: only the group labelled `os` is returned. A block without
 * such labels applies to every platform and is returned whole.
 *
 * @param block - The code block's lines.
 * @param os - The OS label to select (compared case-insensitively).
 * @returns The selected commands, or `null` if the block has groups but none for `os`.
 */
function selectOsCommands(block: string[], os: string): string | null {
	const target = os.toLowerCase();
	const groups = new Map<string, string[]>();
	let current: string[] | null = null;

	for (const line of block) {
		// A bare `# Label` comment line opens a new platform group.
		const label = /^#\s+(\S.*)$/.exec(line.trim());
		if (label != null) {
			current = [];
			groups.set(label[1].trim().toLowerCase(), current);
			continue;
		}
		current?.push(line);
	}

	if (groups.size === 0) {
		return block.join('\n').trim();
	}

	const selected = groups.get(target);
	return selected == null ? null : selected.join('\n').trim();
}

/**
 * Extract the install commands for a single operating system from the README.
 *
 * Only the code blocks in the body of the `Setup` section are considered, not
 * those under its sub-headings (e.g. "Applying later changes"), which are not
 * part of a fresh install.
 *
 * @param readme - The full dotfiles README markdown.
 * @param os - The OS label used in the README's code blocks (e.g. `macOS`, `Linux`).
 * @returns The commands to run in order, one entry per step.
 * @throws If the install section is missing or has no commands for `os`.
 * @example
 * ```ts
 * const steps = extractInstallCommands(readme, 'macOS');
 * // ['curl -sSfL ... | sh ...', 'nix run --accept-flake-config github:ryoppippi/dotfiles']
 * ```
 */
export function extractInstallCommands(readme: string, os: string): string[] {
	const lines = extractSection(readme, INSTALL_HEADING).split('\n');

	// Drop the `Setup` heading itself and stop at its first sub-heading.
	const firstSubHeading = findHeadings(lines).find((h) => h.index > 0);
	const body = lines.slice(1, firstSubHeading?.index ?? lines.length);

	const commands = fencedCodeBlocks(body)
		.map((block) => selectOsCommands(block, os))
		.filter((command): command is string => command != null && command !== '');

	if (commands.length === 0) {
		throw new Error(`No install commands found for: ${os}`);
	}

	return commands;
}

if (import.meta.vitest != null) {
	const sample = [
		'# Title',
		'',
		'## Setup',
		'',
		'### Install',
		'',
		'1. Do a thing',
		'',
		'#### Note',
		'',
		'nested detail',
		'',
		'### Usage',
		'',
		'run it',
	].join('\n');

	test('section extraction keeps nested sub-headings', () => {
		expect(extractSection(sample, 'Install')).toBe(
			['### Install', '', '1. Do a thing', '', '#### Note', '', 'nested detail'].join('\n'),
		);
	});

	test('section extraction matches heading text case-insensitively', () => {
		expect(extractSection(sample, 'install')).toContain('### Install');
	});

	test('section extraction throws when the heading is missing', () => {
		expect(() => extractSection(sample, 'Nope')).toThrow('Section not found');
	});

	const readme = [
		'# dotfiles',
		'',
		'## Setup',
		'',
		'Pick the installer:',
		'',
		'```sh',
		'# macOS',
		'curl -sSfL https://example.com/mac | sh',
		'',
		'# Linux',
		'curl -sSfL https://example.com/linux | sh',
		'```',
		'',
		'Then:',
		'',
		'```sh',
		'nix run github:example/dotfiles',
		'```',
		'',
		'### Applying later changes',
		'',
		'```sh',
		'nix run .#switch',
		'```',
		'',
		'## Daily Usage',
		'',
		'use it',
	].join('\n');

	test('section extraction ignores comment lines inside code fences', () => {
		const setup = extractSection(readme, 'Setup');
		expect(setup).toContain('### Applying later changes');
		expect(setup).not.toContain('## Daily Usage');
		expect(() => extractSection(readme, 'macOS')).toThrow('Section not found');
	});

	test('install commands pick the labelled group for the OS', () => {
		expect(extractInstallCommands(readme, 'macOS')).toEqual([
			'curl -sSfL https://example.com/mac | sh',
			'nix run github:example/dotfiles',
		]);
		expect(extractInstallCommands(readme, 'Linux')).toEqual([
			'curl -sSfL https://example.com/linux | sh',
			'nix run github:example/dotfiles',
		]);
	});

	test('install commands throw when the OS has none', () => {
		const labelledOnly = readme.replace('nix run github:example/dotfiles', '');
		expect(() => extractInstallCommands(labelledOnly, 'Windows')).toThrow(
			'No install commands found',
		);
	});
}
