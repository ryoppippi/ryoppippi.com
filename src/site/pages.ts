import type { BlogPost, PostListItem } from './content.ts';
import { Feed } from 'feed';
import { formatDate } from '../lib/util.ts';
import { escapeHtml, externalAttributes, page } from './html.ts';

export type GeneratedFile = {
	path: string;
	content: string;
};

function home(assets: string): GeneratedFile {
	const socials = [
		['icon-[line-md--github-loop]', 'GitHub profile', '/github'],
		['icon-[ph--git-pull-request-duotone]', 'Recent pull requests', '/pr'],
		['icon-[line-md--linkedin]', 'LinkedIn profile', '/linkedin'],
		['icon-[line-md--twitter]', 'Twitter profile', '/twitter'],
		['icon-[simple-icons--bluesky]', 'Bluesky profile', '/bsky'],
		['icon-[ri--youtube-line]', 'YouTube channel', '/youtube'],
	];
	const socialHtml = socials.map(([icon, label, href]) => `<a class="op-card transition-base hover:scale-110 hover:opacity-100" aria-label="${label}" href="${href}"><span class="${icon} text-5xl" aria-hidden="true"></span></a>`).join('');
	const content = `<article class="gcc container mx-auto mt-8">
		<img class="mx-auto aspect-square w-1/2 rounded-full object-contain md:size-64" alt="ryoppippi profile photo" fetchpriority="high" src="/ryoppippi.avif">
		<h1 class="mb-6 mt-8 text-center text-4xl font-bold" style="view-transition-name:title-ryoppippi">@ryoppippi <span class="animate-pulse text-xl font-medium text-text-700 dark:text-text-200">Engineer</span></h1>
	</article>
	<div class="fcc container mx-auto grid grid-cols-3 gap-6 sm:grid-cols-6">${socialHtml}</div>`;
	return { path: 'index.html', content: page({ title: 'home', pathname: '/', content, assets }) };
}

function blogList(items: PostListItem[], assets: string): GeneratedFile {
	const rows = items.sort((a, b) => b.pubDate.localeCompare(a.pubDate)).map(item => `<li class="blog-item my-2" data-lang="${item.lang}" data-origin="${item.external ? 'external' : 'local'}">
		<a class="group fyc mr-5 gap-3 op-card transition-base hover:no-underline" href="${item.link}"${externalAttributes(item.link)}>
			<span class="${item.external ? 'icon-[quill--link-out]' : 'icon-[simple-icons--markdown]'} blog-list-icon" aria-hidden="true"></span>
			<span>${escapeHtml(item.title)} <small class="pl-2 opacity-50">${formatDate(new Date(item.pubDate))}</small></span>
		</a>
	</li>`).join('');
	const content = `<h1 class="sr-only">Blog</h1>
	<div class="fcol mx-auto gap-1 px-10 pt-10">
		<label class="fyc gap-1 text-sm opacity-50"><input data-filter="english" type="checkbox"> English Only</label>
		<label class="fyc gap-1 text-sm opacity-50"><input data-filter="local" type="checkbox"> ryoppippi.com exclusive</label>
	</div>
	<ul class="mx-auto px-10">${rows}</ul>`;
	return { path: 'blog/index.html', content: page({ title: 'blog', pathname: '/blog/', content, assets }) };
}

function article(post: BlogPost, assets: string): GeneratedFile[] {
	const pathname = `/blog/${post.filename}/`;
	const date = formatDate(new Date(post.pubDate));
	const content = `<link href="${pathname.slice(0, -1)}.md" rel="alternate" title="Markdown source" type="text/plain">
	<hgroup class="fcol fyc mb-3 gap-1 text-center">
		<h1 class="f-text-32-64 my-8 font-mono font-bold leading-none text-stroke-aaa text-transparent">${escapeHtml(post.title)}</h1>
		<p class="text-text-400">${date} ・ ${escapeHtml(post.readingTime.text)} ・ <a aria-label="Markdown source" href="${pathname.slice(0, -1)}.md"><span class="icon-[ri--markdown-line]" aria-hidden="true"></span></a></p>
	</hgroup>
	<article class="prose mx-auto pb-8 text-text-700 dark:prose-invert dark:text-text-200">${post.html}</article>
	<div class="pb-8 opacity-50"><a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" rel="noopener noreferrer" target="_blank">CC BY-NC-SA 4.0</a> 2022-PRESENT © ryoppippi</div>`;
	return [
		{ path: `blog/${post.filename}/index.html`, content: page({ title: `${post.title} | blog`, pathname, content, assets, article: true }) },
		{ path: `blog/${post.filename}.md`, content: post.source },
	];
}

export function feed(posts: BlogPost[]): GeneratedFile {
	const output = new Feed({
		title: 'blog | ryoppippi.com',
		description: 'blog | ryoppippi.com',
		id: 'https://ryoppippi.com',
		link: 'https://ryoppippi.com',
		language: 'en',
		image: 'https://ryoppippi.com/ryoppippi.jpg',
		favicon: 'https://ryoppippi.com/ryoppippi.jpg',
		copyright: 'CC BY-NC-SA 4.0 2022-PRESENT © ryoppippi',
		feedLinks: { rss: 'https://ryoppippi.com/feed.xml' },
	});
	for (const post of posts.filter(post => post.isPublished)) {
		output.addItem({
			title: post.title,
			link: `https://ryoppippi.com/blog/${post.filename}/`,
			date: new Date(post.pubDate),
			description: `${post.title} | ${post.readingTime.text}`,
		});
	}
	return { path: 'feed.xml', content: output.rss2() };
}

export function corePages(posts: BlogPost[], externalPosts: PostListItem[], assets: string): GeneratedFile[] {
	return [
		home(assets),
		blogList([...externalPosts, ...posts.filter(post => post.isPublished).map(post => ({ title: post.title, slug: post.filename, link: `/blog/${post.filename}/`, pubDate: post.pubDate, lang: post.lang, external: false }))], assets),
		...posts.filter(post => post.isPublished).flatMap(post => article(post, assets)),
		feed(posts),
	];
}
