import { execFile } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

function toGitPath(root: string, sourcePath: string): string | undefined {
	const absoluteRoot = path.resolve(root);
	const absolutePath = path.resolve(absoluteRoot, sourcePath);
	const relativePath = path.relative(absoluteRoot, absolutePath);
	return relativePath === '..' ||
		relativePath.startsWith(`..${path.sep}`) ||
		path.isAbsolute(relativePath)
		? undefined
		: relativePath;
}

/**
 * Returns the latest Git commit timestamp for a set of source paths.
 *
 * @param root - Repository root used as the Git working directory.
 * @param sourcePaths - Files or directories whose latest commit should be considered.
 * @returns An ISO 8601 timestamp, or `undefined` when Git history is unavailable.
 * @example
 * ```ts
 * const modified = await gitLastModified(process.cwd(), ['src/site/pages.ts']);
 * ```
 */
export async function gitLastModified(
	root: string,
	sourcePaths: readonly string[],
): Promise<string | undefined> {
	const paths = sourcePaths
		.map((sourcePath) => toGitPath(root, sourcePath))
		.filter((sourcePath): sourcePath is string => sourcePath != null);
	if (paths.length === 0) {
		return undefined;
	}

	const revision = process.env.WORKERS_CI_COMMIT_SHA ?? process.env.CF_PAGES_COMMIT_SHA ?? 'HEAD';
	try {
		const { stdout } = await execFileAsync(
			'git',
			['-C', root, 'log', '-1', '--format=%cI', revision, '--', ...paths],
			{ encoding: 'utf8' },
		);
		const timestamp = stdout.trim();
		return timestamp.length === 0 || Number.isNaN(Date.parse(timestamp))
			? undefined
			: new Date(timestamp).toISOString();
	} catch {
		return undefined;
	}
}
