import type { BlogPost } from './blog.ts';
import type { ShowcaseProject } from './showcase.ts';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

export type ContentArtifact = {
	posts: BlogPost[];
	showcase: ShowcaseProject[];
};

type ContentArtifactFile = ContentArtifact & {
	version: 1;
};

function isContentArtifactFile(value: unknown): value is ContentArtifactFile {
	return (
		typeof value === 'object' &&
		value != null &&
		'version' in value &&
		value.version === 1 &&
		'posts' in value &&
		Array.isArray(value.posts) &&
		'showcase' in value &&
		Array.isArray(value.showcase)
	);
}

export async function readContentArtifact(file: string): Promise<ContentArtifact> {
	const value: unknown = JSON.parse(await readFile(file, 'utf8'));
	if (!isContentArtifactFile(value)) {
		throw new Error('Unsupported content artifact version');
	}
	return { posts: value.posts, showcase: value.showcase };
}

export async function writeContentArtifact(file: string, artifact: ContentArtifact) {
	await mkdir(path.dirname(file), { recursive: true });
	const temporaryFile = `${file}.${process.pid}.${randomUUID()}.tmp`;
	const value = { ...artifact, version: 1 } satisfies ContentArtifactFile;
	await writeFile(temporaryFile, JSON.stringify(value));
	await rename(temporaryFile, file);
}
