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
 * @param fetch - The fetch implementation to use (SvelteKit's scoped `fetch`
 * during prerendering).
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
 * const install = extractSection(readme, 'Initial Setup');
 * ```
 */
export function extractSection(markdown: string, heading: string): string {
	const lines = markdown.split('\n');
	const target = heading.trim().toLowerCase();

	// Match an ATX heading line, capturing its `#` run so we know its level.
	// The text group starts with a non-space character so the `\s+` separator
	// cannot overlap with it (avoids super-linear regex backtracking).
	const headingPattern = /^(#{1,6})\s+(\S.*)$/;

	// Locate the requested heading and remember its level.
	let startIndex = -1;
	let startLevel = 0;
	for (let i = 0; i < lines.length; i++) {
		const match = headingPattern.exec(lines[i]);
		if (match != null && match[2].trim().toLowerCase() === target) {
			startIndex = i;
			startLevel = match[1].length;
			break;
		}
	}

	if (startIndex === -1) {
		throw new Error(`Section not found: ${heading}`);
	}

	// Walk forward until the next heading at the same or a higher level (smaller
	// or equal `#` count); everything before it belongs to this section.
	let endIndex = lines.length;
	for (let i = startIndex + 1; i < lines.length; i++) {
		const match = headingPattern.exec(lines[i]);
		if (match != null && match[1].length <= startLevel) {
			endIndex = i;
			break;
		}
	}

	return lines.slice(startIndex, endIndex).join('\n').trim();
}

/**
 * Heading of the install instructions inside the dotfiles README.
 */
const INSTALL_HEADING = 'Initial Setup';

/**
 * Extract the install steps for a single operating system from the README.
 *
 * The lookup is scoped to the `Initial Setup` section first, so OS sub-headings
 * that appear elsewhere in the README (e.g. under "Available Nix Apps") are
 * never matched by mistake.
 *
 * @param readme - The full dotfiles README markdown.
 * @param os - The OS sub-heading to extract (e.g. `macOS`, `Linux`).
 * @returns The OS-specific install section as markdown text.
 * @throws If the install section or the OS sub-heading is missing.
 * @example
 * ```ts
 * const mac = extractInstallSection(readme, 'macOS');
 * ```
 */
export function extractInstallSection(readme: string, os: string): string {
	const install = extractSection(readme, INSTALL_HEADING);
	return extractSection(install, os);
}

/**
 * Remove the shared leading indentation from a block of lines.
 *
 * @param lines - The lines to dedent.
 * @returns The lines joined back together with the common indent stripped.
 */
function dedent(lines: string[]): string {
	// Measure indentation only on non-blank lines so blank lines do not force
	// the common indent down to zero.
	const indents = lines
		.filter((line) => line.trim() !== '')
		.map((line) => line.length - line.trimStart().length);
	const min = indents.length > 0 ? Math.min(...indents) : 0;
	return lines.map((line) => line.slice(min)).join('\n');
}

/**
 * Extract the contents of the first fenced code block in a block of lines.
 *
 * @param lines - The lines to scan (typically the body of one list item).
 * @returns The dedented, trimmed code, or `null` if there is no code block.
 */
function firstFencedCode(lines: string[]): string | null {
	const collected: string[] = [];
	let insideFence = false;

	for (const line of lines) {
		// A fence marker may be indented because it lives inside a list item.
		const isFence = line.trimStart().startsWith('```');

		if (isFence) {
			// First marker opens the block; the next one closes it, so we stop.
			if (!insideFence) {
				insideFence = true;
				continue;
			}
			break;
		}

		if (insideFence) {
			collected.push(line);
		}
	}

	if (collected.length === 0) {
		return null;
	}

	return dedent(collected).trim();
}

/**
 * Parse the numbered steps of an install section into their shell commands.
 *
 * Only steps that contain a fenced code block are returned, so prose-only
 * steps are skipped. The step number is taken from the markdown ordered list.
 *
 * @param section - An OS install section (e.g. the result of {@link extractInstallSection}).
 * @returns The steps that carry a command, in document order.
 * @example
 * ```ts
 * const steps = parseStepCommands(extractInstallSection(readme, 'macOS'));
 * // [{ step: 1, command: 'curl -sSfL ... | sh ...' }, ...]
 * ```
 */
export function parseStepCommands(section: string): { step: number; command: string }[] {
	const lines = section.split('\n');
	const steps: { step: number; lines: string[] }[] = [];
	let current: { step: number; lines: string[] } | null = null;

	for (const line of lines) {
		// A top-level ordered-list item starts a new step: a number, a dot and
		// whitespace with no leading indentation (indented lines belong to the
		// current step's body, including its code fences and notes).
		const match = /^(\d+)\.\s/.exec(line);

		if (match != null) {
			if (current != null) {
				steps.push(current);
			}
			current = { step: Number(match[1]), lines: [] };
		} else if (current != null) {
			current.lines.push(line);
		}
	}

	if (current != null) {
		steps.push(current);
	}

	const result: { step: number; command: string }[] = [];
	for (const { step, lines: body } of steps) {
		const command = firstFencedCode(body);
		if (command != null && command !== '') {
			result.push({ step, command });
		}
	}

	return result;
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

	describe(extractSection, () => {
		it('extracts a section and keeps nested sub-headings', () => {
			expect(extractSection(sample, 'Install')).toBe(
				['### Install', '', '1. Do a thing', '', '#### Note', '', 'nested detail'].join('\n'),
			);
		});

		it('stops at the next heading of the same level', () => {
			expect(extractSection(sample, 'Install')).not.toContain('Usage');
		});

		it('matches heading text case-insensitively', () => {
			expect(extractSection(sample, 'install')).toContain('### Install');
		});

		it('throws when the heading is missing', () => {
			expect(() => extractSection(sample, 'Nope')).toThrow('Section not found');
		});
	});

	const readme = [
		'## Nix Configuration',
		'',
		'### Initial Setup',
		'',
		'#### macOS',
		'',
		'mac steps',
		'',
		'#### Linux',
		'',
		'linux steps',
		'',
		'### Available Nix Apps',
		'',
		'#### macOS',
		'',
		'mac apps',
	].join('\n');

	describe(extractInstallSection, () => {
		it('extracts the OS section scoped to Initial Setup', () => {
			expect(extractInstallSection(readme, 'macOS')).toBe('#### macOS\n\nmac steps');
		});

		it('does not match OS sub-headings outside Initial Setup', () => {
			expect(extractInstallSection(readme, 'macOS')).not.toContain('mac apps');
		});

		it('extracts the last OS section up to the end of Initial Setup', () => {
			expect(extractInstallSection(readme, 'Linux')).toBe('#### Linux\n\nlinux steps');
		});
	});

	const macSection = [
		'#### macOS',
		'',
		'1. Install Nix:',
		'',
		'   ```sh',
		'    curl -sSfL https://example.com/install | sh',
		'   ```',
		'',
		'2. Clone:',
		'',
		'   ```sh',
		'   git clone https://example.com/repo',
		'   cd repo',
		'   ```',
		'',
		'3. Sign in:',
		'',
		'   ```sh',
		'   open -a "App Store"',
		'   ```',
		'',
		'   > [!NOTE]',
		'   > Do it manually.',
	].join('\n');

	describe(parseStepCommands, () => {
		it('returns one entry per numbered step with its command', () => {
			expect(parseStepCommands(macSection)).toEqual([
				{ step: 1, command: 'curl -sSfL https://example.com/install | sh' },
				{ step: 2, command: 'git clone https://example.com/repo\ncd repo' },
				{ step: 3, command: 'open -a "App Store"' },
			]);
		});

		it('dedents code regardless of inconsistent indentation', () => {
			expect(parseStepCommands(macSection)[0].command).not.toMatch(/^\s/);
		});

		it('ignores non-code content such as note blockquotes', () => {
			expect(parseStepCommands(macSection)[2].command).toBe('open -a "App Store"');
		});

		it('skips steps that have no code block', () => {
			const section = [
				'1. Just read this.',
				'',
				'2. Run:',
				'',
				'   ```sh',
				'   echo hi',
				'   ```',
			].join('\n');
			expect(parseStepCommands(section)).toEqual([{ step: 2, command: 'echo hi' }]);
		});
	});
}
