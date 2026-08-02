import type { IslandRenderer, TweetRenderer } from '../src/markdown/render.ts';
import type { ContentArtifact } from '../src/artifact.ts';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { createServer } from 'vite';

type ContentArtifactModule = {
	buildContentArtifact: (
		renderTweet: TweetRenderer,
		renderIsland: IslandRenderer,
	) => Promise<ContentArtifact>;
};

type IslandRendererModule = {
	createIslandRenderer: (load: (path: string) => Promise<unknown>) => IslandRenderer;
};

type ContentArtifactFormatModule = {
	writeContentArtifact: (file: string, artifact: ContentArtifact) => Promise<void>;
};

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'dist');
// Svelte derives a component's style scope class from its path relative to
// `rootDir`, which defaults to the working directory. This build runs from the
// content package while the site build runs from the workspace root, so without
// pinning it the two disagree and the island CSS shipped by the site build
// cannot match the markup rendered here.
const workspaceRoot = path.resolve(root, '../..');
const server = await createServer({
	appType: 'custom',
	configFile: false,
	logLevel: 'error',
	plugins: [svelte({ compilerOptions: { rootDir: workspaceRoot } })],
	publicDir: false,
	root,
	server: { middlewareMode: true },
});

const start = performance.now();
try {
	const [{ renderTweet }, builder, format, islands] = await Promise.all([
		server.ssrLoadModule('/src/tweet-renderer.ts') as Promise<{ renderTweet: TweetRenderer }>,
		server.ssrLoadModule('/src/build.ts') as Promise<ContentArtifactModule>,
		server.ssrLoadModule('/src/artifact.ts') as Promise<ContentArtifactFormatModule>,
		server.ssrLoadModule('/src/island-renderer.ts') as Promise<IslandRendererModule>,
	]);
	const renderIsland = islands.createIslandRenderer((path) => server.ssrLoadModule(path));
	const artifact = await builder.buildContentArtifact(renderTweet, renderIsland);
	await rm(outDir, { recursive: true, force: true });
	await format.writeContentArtifact(path.join(outDir, 'content.json'), artifact);
	console.info(
		`[perf] content posts=${artifact.posts.length} showcase=${artifact.showcase.length} duration=${(performance.now() - start).toFixed(1)}ms`,
	);
} finally {
	await server.close();
}
