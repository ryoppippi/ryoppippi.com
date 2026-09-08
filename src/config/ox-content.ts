import type { OxContentOptions } from '@ox-content/vite-plugin';
import { SITE_NAME, SITE_ORIGIN } from './site.ts';
import { REDIRECT_ROUTES } from './redirects.ts';
import { OPEN_GRAPH_OPTIONS } from './open-graph.ts';
import { OX_MARKDOWN_OPTIONS, twitterCacheDirectory, twitterMediaDirectory } from './markdown.ts';
import { BLOG_SOURCE_PATTERNS, SHOWCASE_SOURCE_PATTERN } from './content.ts';
import { BLOG_FEED_OPTIONS } from '../pages/blog/feed.ts';
import { MEDIA_FEED_OPTIONS } from '../pages/works/media/feed.ts';

/** Public stylesheet shared by the custom host's dev server and build writer. */
export const SYNTAX_THEME_HREF = '/__ox_theme_tokens__/syntax.css';

const redirects = [...REDIRECT_ROUTES, { from: '/works', to: '/works/oss', status: 301 }] as const;
const redirectMap = Object.fromEntries(redirects.map(({ from, to }) => [from, to]));

export const OX_CONTENT_BUILD_OPTIONS = {
	...OX_MARKDOWN_OPTIONS,
	frontmatter: true,
	srcDir: 'src/content',
	outDir: 'dist',
	collections: {
		blog: { source: BLOG_SOURCE_PATTERNS.map((pattern) => `blog/${pattern}`), include: ['body'] },
		showcase: { source: SHOWCASE_SOURCE_PATTERN, include: ['body'] },
	},
	docs: false,
	icons: {
		include: ['src/**/*.{css,json,md,mdx,ts,tsx}'],
	},
	embeds: {
		bluesky: true,
		github: false,
		openGraph: OPEN_GRAPH_OPTIONS,
		twitter: {
			appearance: 'full',
			cacheDir: twitterCacheDirectory,
			downloadVideo: true,
			fetch: true,
			mediaOutputDir: twitterMediaDirectory,
			mediaPublicPath: '/ox-content/twitter',
			timeZone: 'Europe/London',
		},
	},
	feeds: {
		blog: BLOG_FEED_OPTIONS,
		media: MEDIA_FEED_OPTIONS,
	},
	permalinks: true,
	notByAi: true,
	redirects: {
		allowExternal: true,
		html: false,
		map: redirectMap,
		provider: 'cloudflare',
	},
	ssg: {
		readerChrome: { backToTop: false, copy: true, externalLinks: false },
		bare: true,
		markdownSource: { alternate: true },
		minifyHtml: true,
		siteName: `blog | ${SITE_NAME}`,
		siteUrl: SITE_ORIGIN,
		transformConcurrency: 4,
		theme: {
			fonts: {
				sans: {
					family: 'Inter',
					provider: 'local',
					path: '@fontsource/inter',
					weights: [400, 600, 800],
					selfHost: true,
				},
				mono: {
					family: 'DM Mono',
					provider: 'local',
					path: '@fontsource/dm-mono',
					weights: [400, 500],
					selfHost: true,
				},
				named: {
					code: {
						family: 'JetBrains Mono',
						provider: 'local',
						path: '@fontsource/jetbrains-mono',
						weights: [400, 600],
						selfHost: true,
					},
					condensed: {
						family: 'Roboto Condensed',
						provider: 'local',
						path: '@fontsource/roboto-condensed',
						weights: [400, 700],
						selfHost: true,
					},
				},
			},
		},
	},
} as const satisfies OxContentOptions;

if (import.meta.vitest != null) {
	test('mounts every blog source below the public blog route', async () => {
		const [fs, path, tinyglobby] = await Promise.all([
			import('node:fs/promises'),
			import('node:path'),
			import('tinyglobby'),
		]);
		const root = path.join(process.cwd(), 'src/content/blog');
		const files = await tinyglobby.glob(BLOG_SOURCE_PATTERNS, { cwd: root });

		for (const file of files) {
			const slug = path.dirname(file);
			expect(await fs.readFile(path.join(root, file), 'utf8')).toMatch(
				new RegExp(`^---\\npermalink: /blog/${slug}\\n`),
			);
		}
	});
}
