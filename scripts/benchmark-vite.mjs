import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const [output, ...roots] = process.argv.slice(2);
const labels = ['solid-v2', 'svelte-official', 'rsvelte'];
if (!output || roots.length !== labels.length) {
	throw new Error(
		'Usage: node scripts/benchmark-vite.mjs <output> <solid-root> <official-root> <rsvelte-root>',
	);
}
if (fs.existsSync(output))
	throw new Error('Use a new output directory to preserve previous samples');
fs.mkdirSync(output, { recursive: true });

const run = (root, command, args) => {
	const result = spawnSync(command, args, {
		cwd: root,
		encoding: 'utf8',
		maxBuffer: 16 * 1024 * 1024,
		env: { ...process.env, PUBLIC_ORIGIN: 'https://ryoppippi.com', CI: 'false' },
	});
	if (result.error) throw result.error;
	return result;
};
const sha256 = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const configurations = roots.map((root, index) => ({
	label: labels[index],
	root: path.resolve(root),
	commit: run(root, 'git', ['rev-parse', 'HEAD']).stdout.trim(),
	lockfileSha256: sha256(path.join(root, 'pnpm-lock.yaml')),
	configSha256: sha256(path.join(root, 'vite.config.ts')),
	runs: [],
}));
const report = {
	startedAt: new Date().toISOString(),
	command: 'node_modules/.bin/vpr --no-cache build',
	harnessNode: process.version,
	machine: { model: os.cpus()[0].model, cpus: os.cpus().length, arch: os.arch(), os: os.release() },
	power: run(roots[2], 'pmset', ['-g', 'batt']).stdout.trim(),
	loadAverageAtStart: os.loadavg(),
	cachePolicy:
		'Cold removes dist and node_modules/.vite and .vite-temp. Warm removes dist only. Installed dependencies, remote content and OS caches remain. Task-result cache disabled by vpr --no-cache.',
	order: [],
	configurations,
};
const save = () =>
	fs.writeFileSync(path.join(output, 'timings.json'), JSON.stringify(report, null, 2) + '\n');

// Keep the previous artifacts and rotate configuration order to limit order bias.
for (const configuration of configurations) {
	fs.cpSync(
		path.join(configuration.root, 'dist'),
		path.join(output, 'before', configuration.label),
		{ recursive: true },
	);
}
save();
for (let repetition = 1; repetition <= 3; repetition++) {
	for (let offset = 0; offset < configurations.length; offset++) {
		const configuration = configurations[(repetition - 1 + offset) % configurations.length];
		for (const cache of ['cold', 'warm']) {
			fs.rmSync(path.join(configuration.root, 'dist'), { recursive: true, force: true });
			if (cache === 'cold') {
				for (const directory of ['node_modules/.vite', 'node_modules/.vite-temp']) {
					fs.rmSync(path.join(configuration.root, directory), { recursive: true, force: true });
				}
			}
			const started = performance.now();
			const result = run(configuration.root, 'node_modules/.bin/vpr', ['--no-cache', 'build']);
			const wallSeconds = (performance.now() - started) / 1000;
			const log = result.stdout + result.stderr;
			const logFile = `${configuration.label}-${cache}-${repetition}.log`;
			fs.writeFileSync(path.join(output, logFile), log);
			if (result.status !== 0) throw new Error(`Build failed; see ${logFile}`);
			const cleanLog = log.replace(/\u001b\[[0-9;]*m/g, '');
			const viteTimes = [...cleanLog.matchAll(/built in ([\d.]+)\s*(ms|s)\b/g)];
			const generated = cleanLog.match(/generated (\d+) output files/);
			if (viteTimes.length !== 1 || !generated) {
				throw new Error(`Expected one Vite timer and a full SSG marker; see ${logFile}`);
			}
			const [, value, unit] = viteTimes[0];
			const sample = {
				cache,
				repetition,
				wallSeconds,
				viteMilliseconds: Number(value) * (unit === 's' ? 1000 : 1),
				outputs: Number(generated[1]),
				logFile,
			};
			configuration.runs.push(sample);
			report.order.push(`${configuration.label}/${cache}/${repetition}`);
			save();
			console.log(JSON.stringify({ label: configuration.label, ...sample }));
		}
	}
}
report.finishedAt = new Date().toISOString();
report.loadAverageAtEnd = os.loadavg();
save();
