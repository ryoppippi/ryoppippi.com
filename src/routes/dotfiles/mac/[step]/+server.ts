import type { EntryGenerator, RequestHandler } from './$types';
import { extractInstallSection, fetchDotfilesReadme, parseStepCommands } from '$lib/dotfiles';
import { error } from '@sveltejs/kit';

export const prerender = true;

/** OS sub-heading whose steps this route exposes. */
const OS = 'macOS';

/**
 * Resolve the command for a single macOS install step.
 *
 * `curl https://ryoppippi.com/dotfiles/mac/2` returns just the command of
 * step 2 (no prose, no numbering, no code fences) so it can be piped to
 * `pbcopy` or, once reviewed, to a shell.
 */
async function stepCommands(fetch: typeof globalThis.fetch): Promise<{ step: number; command: string }[]> {
	const readme = await fetchDotfilesReadme(fetch);
	return parseStepCommands(extractInstallSection(readme, OS));
}

export const entries = (async () => {
	const steps = await stepCommands(fetch);
	return steps.map(({ step }) => ({ step: String(step) }));
}) satisfies EntryGenerator;

export const GET = (async ({ params, fetch }) => {
	try {
		const steps = await stepCommands(fetch);
		const found = steps.find(({ step }) => String(step) === params.step);

		if (found == null) {
			error(404, `No macOS install step ${params.step}`);
		}

		return new Response(found.command, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
			},
		});
	}
	catch (e) {
		console.error(e);
		error(502, 'Failed to build dotfiles macOS install step');
	}
}) satisfies RequestHandler;
