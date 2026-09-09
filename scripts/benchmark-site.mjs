import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { gzipSync, brotliCompressSync, constants } from 'node:zlib';
const [root, label, output = '.benchmark-results'] = process.argv.slice(2);
if (!root || !label)
	throw new Error('Usage: node scripts/benchmark-site.mjs <checkout> <label> <results-directory>');
fs.mkdirSync(output, { recursive: true });
const walk = (dir) =>
	fs
		.readdirSync(dir, { withFileTypes: true })
		.flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
const sizes = (files) =>
	files.reduce(
		(sum, file) => {
			const data = fs.readFileSync(file);
			return {
				count: sum.count + 1,
				raw: sum.raw + data.length,
				gzip: sum.gzip + gzipSync(data, { level: 9 }).length,
				brotli:
					sum.brotli +
					brotliCompressSync(data, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length,
			};
		},
		{ count: 0, raw: 0, gzip: 0, brotli: 0 },
	);
const run = (command, args) => {
	const r = spawnSync(command, args, {
		cwd: root,
		encoding: 'utf8',
		env: { ...process.env, PUBLIC_ORIGIN: 'https://ryoppippi.com', CI: 'false' },
	});
	if (r.status !== 0) throw new Error(r.stdout + r.stderr);
	return r.stdout.trim();
};
const result = {
	label,
	root,
	commit: run('git', ['rev-parse', 'HEAD']),
	harnessNode: process.version,
	buildNode: run('pnpm', ['exec', 'node', '--version']),
	pnpm: run('pnpm', ['--version']),
	machine: { model: os.cpus()[0].model, arch: os.arch(), cpus: os.cpus().length, os: os.release() },
	command: 'PUBLIC_ORIGIN=https://ryoppippi.com CI=false pnpm exec vp build',
	cachePolicy:
		'Cold: remove dist, node_modules/.vite and node_modules/.vite-temp. Warm: retain Vite cache from preceding cold run; remove dist. Retain identical .cache/ox-content remote-content cache and OS filesystem cache; dependencies already installed. No Vite+ task result cache.',
	runs: [],
};
// Alternate cache conditions and force the full SSG pipeline on every sample.
for (let repetition = 1; repetition <= 3; repetition++)
	for (const cache of ['cold', 'warm']) {
		fs.rmSync(path.join(root, 'dist'), { recursive: true, force: true });
		if (cache === 'cold')
			for (const dir of ['node_modules/.vite', 'node_modules/.vite-temp'])
				fs.rmSync(path.join(root, dir), { recursive: true, force: true });
		const start = performance.now();
		const log = run('pnpm', ['exec', 'vp', 'build']);
		const seconds = (performance.now() - start) / 1000;
		fs.writeFileSync(path.join(output, `${label}-${cache}-${repetition}.log`), log);
		const generated = log.match(/generated (\d+) output files/);
		if (!generated) throw new Error('Full SSG output marker missing');
		result.runs.push({ cache, repetition, seconds, outputs: Number(generated[1]) });
		fs.writeFileSync(path.join(output, `${label}.json`), JSON.stringify(result, null, 2));
		console.log(JSON.stringify({ label, cache, repetition, seconds, outputs: generated[1] }));
	}
// Compress after timing so compression work does not contaminate build samples.
const files = walk(path.join(root, 'dist'));
result.assets = Object.fromEntries(
	['js', 'css', 'html'].map((ext) => [ext, sizes(files.filter((f) => f.endsWith('.' + ext)))]),
);
result.pages = {};
for (const route of ['index.html', 'about/index.html', 'blog/2026-08-15-uk-gtv-en/index.html']) {
	const html = fs.readFileSync(path.join(root, 'dist', route), 'utf8');
	const refs = [...html.matchAll(/<(?:script|link)\b[^>]*>/g)].flatMap(([tag]) => {
		if (tag.startsWith('<link') && !/rel="(?:stylesheet|modulepreload)"/.test(tag)) return [];
		const m = tag.match(/(?:src|href)="([^"#?]+)(?:[?#][^"]*)?"/);
		return m && m[1].startsWith('/') ? [m[1]] : [];
	});
	const existing = [...new Set(refs)]
		.map((f) => path.join(root, 'dist', f))
		.filter((f) => fs.existsSync(f) && /\.(css|js)$/.test(f));
	result.pages[route] = {
		document: sizes([path.join(root, 'dist', route)]),
		initialReferencedAssets: sizes(existing),
		files: existing.map((f) => path.relative(path.join(root, 'dist'), f)),
		islands: (html.match(/data-ox-island=/g) || []).length,
	};
}
result.manifest = JSON.parse(fs.readFileSync(path.join(root, 'dist/.vite/manifest.json'), 'utf8'));
fs.writeFileSync(path.join(output, `${label}.json`), JSON.stringify(result, null, 2));
console.log(JSON.stringify({ label, assets: result.assets, pages: result.pages }));
