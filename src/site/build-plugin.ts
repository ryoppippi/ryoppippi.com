import type { Plugin } from 'vite';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export function staticSiteBuild(): Plugin {
	return {
		name: 'ryoppippi-static-site-build',
		apply: (_config, { command, mode }) => command === 'build' && mode !== 'test',
		async closeBundle() {
			await execFileAsync(process.execPath, ['scripts/generate-site.ts'], { cwd: process.cwd() });
		},
	};
}
