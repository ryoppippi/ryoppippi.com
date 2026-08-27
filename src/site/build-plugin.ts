import type { Plugin } from 'vite';
import { spawn } from 'node:child_process';
import path from 'node:path';

async function generateStaticSite(): Promise<void> {
	await new Promise<void>((resolve, reject) => {
		const bun = path.join(
			process.cwd(),
			'node_modules/.bin',
			process.platform === 'win32' ? 'bun.cmd' : 'bun',
		);
		const child = spawn(bun, ['scripts/generate-site.ts'], {
			cwd: process.cwd(),
			stdio: 'inherit',
		});
		child.once('error', reject);
		child.once('exit', (code, signal) => {
			if (code === 0) {
				resolve();
				return;
			}
			reject(new Error(`Static site generation failed with ${signal ?? `exit code ${code}`}`));
		});
	});
}

/**
 * Runs the custom site generator once after every Vite build environment closes.
 *
 * @returns The Vite plugin that owns the final static output pass.
 */
export function staticSiteBuild(): Plugin {
	let generation: Promise<void> | undefined;

	return {
		name: 'ryoppippi-static-site-build',
		apply: (_config, { command, mode }) => command === 'build' && mode !== 'test',
		async closeBundle() {
			generation ??= generateStaticSite();
			await generation;
		},
	};
}
