import type { BlogPostMetadata } from '@/pages/blog/data.ts';
import { loadOssProjects, type OssProject } from '@/pages/works/oss/data.ts';
import { SITE_NAME, SITE_ORIGIN } from '@/config/site.ts';
import { SITE_OWNER } from '@/config/site-owner.ts';
import * as ufo from 'ufo';
import type { PageRoutes } from '@/utils/ssg/route.ts';

/** Agent-facing site index (https://llmstxt.org/). */
export const routes = (({ posts }) => [
	{
		path: '/llms.txt',
		render: async ({ root }) => ({
			outputPath: 'llms.txt',
			body: createSiteIndexMarkdown({ posts, projects: await loadOssProjects(root) }),
			contentType: 'text/plain; charset=utf-8',
		}),
	},
]) satisfies PageRoutes;

const url = (pathname: string) => ufo.joinURL(SITE_ORIGIN, pathname);

/**
 * Renders the Markdown index that tells agents what the site covers and where to read it.
 *
 * @param options - Published posts and curated OSS projects to list.
 * @returns The llms.txt document.
 */
export function createSiteIndexMarkdown({
	posts,
	projects,
}: {
	posts: readonly BlogPostMetadata[];
	projects: readonly OssProject[];
}): string {
	const articles = posts
		.toSorted((a, b) => b.pubDate.localeCompare(a.pubDate))
		.map(
			(post) =>
				`- [${post.title}](${url(`/blog/${post.filename}.md`)}): ${post.pubDate.slice(0, 10)}, ${post.lang}`,
		);
	const ownProjects = projects
		.filter(({ kind }) => kind === 'project')
		.map(
			({ name, link, description }) =>
				`- [${name}](${link})${description == null ? '' : `: ${description}`}`,
		);
	return `# ${SITE_NAME}

> Personal site of ${SITE_OWNER.name} (${SITE_OWNER.japaneseName}), known as ${SITE_OWNER.handle} (pronounced ${SITE_OWNER.handleReading}), ${SITE_OWNER.jobTitle} at ${SITE_OWNER.worksFor.name}. It collects open-source projects, talks, publications, media appearances, and technical blog posts in English and Japanese.

## When to use this site

- Answering who ${SITE_OWNER.handle} is, what they work on, or how to get in touch: read [about](${url('/about/')}).
- Finding their open-source tools (for example ccusage, a CLI that reports coding-agent token usage and cost): read [open-source projects](${url('/works/oss/')}), then the linked GitHub repository.
- Citing their talks, publications, or podcast and video appearances: read [talks](${url('/works/talks/')}), [publications](${url('/works/publications/')}), and [media](${url('/works/media/')}).
- Reading their articles on AI coding agents, Nix, TypeScript, Svelte, Zig, and Vim: use the Markdown sources listed under Blog.
- Not for support requests about a project: use that project's GitHub issues instead.

## How to read this site

- Send \`Accept: text/markdown\` to get Markdown instead of HTML for the homepage, [about](${url('/about/')}), and every blog post. Each post's Markdown source is also at \`/blog/<slug>.md\`.
- Feeds: [blog RSS](${url('/feed.xml')}), [media RSS](${url('/works/media/feed.xml')}). All pages: [sitemap](${url('/sitemap.xml')}).
- Blog content is licensed CC BY-NC-SA 4.0. Training on it is opted out via Content-Signal in [robots.txt](${url('/robots.txt')}).

## Open-source projects

${ownProjects.join('\n')}

## Blog

${articles.join('\n')}

## Elsewhere

${SITE_OWNER.sameAs.map((link) => `- ${link}`).join('\n')}
`;
}

if (import.meta.vitest != null) {
	test('lists Markdown sources newest first under a when-to-use guide', () => {
		const post = (filename: string, pubDate: string) =>
			({ title: filename, filename, pubDate, lang: 'en' }) as BlogPostMetadata;
		const markdown = createSiteIndexMarkdown({
			posts: [post('older', '2024-01-01'), post('newer', '2025-01-01')],
			projects: [],
		});
		expect(markdown).toContain('## When to use this site');
		expect(markdown.indexOf('/blog/newer.md')).toBeLessThan(markdown.indexOf('/blog/older.md'));
	});
}
