import { Buffer } from 'node:buffer';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { performance } from 'node:perf_hooks';
import process from 'node:process';

const compareDir = '.ox-content-compare';
const currentDir = join(compareDir, 'markdown-it');
const oxContentDir = join(compareDir, 'ox-content');
const reportPath = join(compareDir, 'report.json');
const compareProd = process.argv.includes('--prod');

function run(command, args, env = {}) {
	const startedAt = performance.now();
	const result = spawnSync(command, args, {
		env: { PUBLIC_ORIGIN: 'https://ryoppippi.com', ...process.env, ...env },
		stdio: 'inherit',
	});
	const elapsedMs = performance.now() - startedAt;

	if (result.status !== 0) {
		throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}`);
	}

	return elapsedMs;
}

function build(name, targetDir, env = {}) {
	rmSync('build', { recursive: true, force: true });
	const elapsedMs = run('pnpm', ['build'], env);
	rmSync(targetDir, { recursive: true, force: true });
	cpSync('build', targetDir, { recursive: true });

	return {
		name,
		elapsedMs,
	};
}

function listHtmlFiles(dir) {
	if (!existsSync(dir)) {
		return [];
	}

	return readdirSync(dir, { recursive: true, withFileTypes: true })
		.filter(entry => entry.isFile() && entry.name.endsWith('.html'))
		.map(entry => join(entry.parentPath, entry.name))
		.map(file => relative(dir, file).split(sep).join('/'))
		.sort();
}

function readHtml(dir, file) {
	return readFileSync(join(dir, file), 'utf-8');
}

function hash(value) {
	return createHash('sha256').update(value).digest('hex');
}

function summarizeLocalDiff() {
	const currentFiles = new Set(listHtmlFiles(currentDir));
	const oxContentFiles = new Set(listHtmlFiles(oxContentDir));
	const allFiles = [...new Set([...currentFiles, ...oxContentFiles])].sort();
	const changed = [];
	const onlyCurrent = [];
	const onlyOxContent = [];
	const identical = [];

	for (const file of allFiles) {
		if (!currentFiles.has(file)) {
			onlyOxContent.push(file);
			continue;
		}

		if (!oxContentFiles.has(file)) {
			onlyCurrent.push(file);
			continue;
		}

		const currentHtml = readHtml(currentDir, file);
		const oxContentHtml = readHtml(oxContentDir, file);

		if (currentHtml === oxContentHtml) {
			identical.push(file);
			continue;
		}

		changed.push({
			file,
			currentBytes: Buffer.byteLength(currentHtml),
			oxContentBytes: Buffer.byteLength(oxContentHtml),
			currentHash: hash(currentHtml),
			oxContentHash: hash(oxContentHtml),
		});
	}

	return {
		total: allFiles.length,
		identical: identical.length,
		changed,
		onlyCurrent,
		onlyOxContent,
	};
}

function fileToPath(file) {
	if (file === 'index.html') {
		return '/';
	}

	if (file.endsWith('/index.html')) {
		return `/${file.slice(0, -'/index.html'.length)}/`;
	}

	return `/${file.replace(/\.html$/, '')}`;
}

async function summarizeProdDiff() {
	const currentFiles = listHtmlFiles(currentDir);
	const changed = [];
	const missing = [];

	for (const file of currentFiles) {
		const path = fileToPath(file);
		const response = await fetch(new URL(path, 'https://ryoppippi.com'));

		if (!response.ok) {
			missing.push({ file, path, status: response.status });
			continue;
		}

		const prodHtml = await response.text();
		const currentHtml = readHtml(currentDir, file);

		if (prodHtml !== currentHtml) {
			changed.push({
				file,
				path,
				currentBytes: Buffer.byteLength(currentHtml),
				prodBytes: Buffer.byteLength(prodHtml),
				currentHash: hash(currentHtml),
				prodHash: hash(prodHtml),
			});
		}
	}

	return {
		total: currentFiles.length,
		changed,
		missing,
	};
}

mkdirSync(compareDir, { recursive: true });

const builds = [
	build('markdown-it', currentDir, { OX_CONTENT_MARKDOWN: '0' }),
	build('ox-content', oxContentDir),
];

const report = {
	generatedAt: new Date().toISOString(),
	builds,
	local: summarizeLocalDiff(),
	prod: compareProd ? await summarizeProdDiff() : null,
};

writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify({
	reportPath,
	builds,
	local: {
		total: report.local.total,
		identical: report.local.identical,
		changed: report.local.changed.length,
		onlyCurrent: report.local.onlyCurrent.length,
		onlyOxContent: report.local.onlyOxContent.length,
	},
	prod: report.prod == null
		? null
		: {
				total: report.prod.total,
				changed: report.prod.changed.length,
				missing: report.prod.missing.length,
			},
}, null, 2));
