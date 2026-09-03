import type { JSX } from '@solidjs/web';
import { initIslands, type IslandController } from '@ox-content/islands';
import { enhanceMarkdownTables } from '@ox-content/vite-plugin/markdown-tables';
import { initReaderChrome } from '@ox-content/vite-plugin/reader-chrome/client';
import { applyThemeTransition } from '@ox-content/vite-plugin/theme-transition/client';
import { initTweetCards } from '@ox-content/vite-plugin/twitter/client';
import {
	loadPageStyle,
	missingPageStyles,
	needsInitialPageStyle,
	obsoletePageStyles,
} from './page-style-loader.ts';
import { hashTargetId } from './navigation.ts';
import './style.css';

// SiteLayout is rendered only by the SSG, so this dynamic entry exposes its CSS to
// the manifest used to generate a blocking stylesheet link.
void import('./components/SiteLayout/SiteLayout.module.css');

function initialiseThemeToggle(): void {
	const target = document.querySelector<HTMLElement>('[data-dark-mode]');
	if (target == null) {
		return;
	}

	const button = document.createElement('button');
	const icon = document.createElement('span');
	icon.ariaHidden = 'true';
	button.append(icon);
	target.append(button);

	const render = () => {
		const dark = document.documentElement.classList.contains('dark');
		button.ariaLabel = dark ? 'Switch to light mode' : 'Switch to dark mode';
		icon.className = dark
			? 'icon-[line-md--sunny-filled-loop-to-moon-filled-transition]'
			: 'icon-[line-md--moon-filled-to-sunny-filled-loop-transition]';
	};
	button.addEventListener('click', (event) => {
		const dark = !document.documentElement.classList.contains('dark');
		void applyThemeTransition({
			event,
			nextTheme: dark ? 'dark' : 'light',
			apply: () => {
				document.documentElement.classList.toggle('dark', dark);
				document.documentElement.dataset.theme = dark ? 'dark' : 'light';
				localStorage.theme = dark ? 'dark' : 'light';
				render();
			},
		});
	});
	render();
}

function initialiseBlogFilters(): void {
	for (const button of document.querySelectorAll<HTMLButtonElement>('[data-filter]')) {
		button.addEventListener('click', () => {
			const pressed = button.ariaPressed !== 'true';
			button.ariaPressed = String(pressed);
			button.querySelector('span')?.classList.toggle('icon-[carbon--checkbox]', !pressed);
			button.querySelector('span')?.classList.toggle('icon-[carbon--checkbox-checked]', pressed);
			const english =
				document.querySelector<HTMLButtonElement>('[data-filter="english"]')?.ariaPressed ===
				'true';
			const local =
				document.querySelector<HTMLButtonElement>('[data-filter="local"]')?.ariaPressed === 'true';
			const items = document.querySelectorAll<HTMLElement>('[data-blog-item]');
			for (const item of items) {
				item.hidden =
					(english && item.dataset.lang !== 'en') || (local && item.dataset.origin !== 'local');
			}
			const status = document.querySelector<HTMLElement>('#blog-filter-status');
			if (status != null) {
				const activeFilters = [
					english ? 'English only' : undefined,
					local ? 'ryoppippi.com exclusive' : undefined,
				].filter((filter): filter is string => filter != null);
				const visible = [...items].filter((item) => !item.hidden).length;
				status.textContent =
					activeFilters.length === 0
						? `Showing all ${items.length} blog posts`
						: `Showing ${visible} of ${items.length} blog posts (${activeFilters.join(' and ')})`;
			}
		});
	}
}

function initialiseTalkFilter(): void {
	const button = document.querySelector<HTMLButtonElement>('[data-talk-filter="english"]');
	if (button == null) {
		return;
	}

	button.addEventListener('click', () => {
		const pressed = button.ariaPressed !== 'true';
		button.ariaPressed = String(pressed);
		button.querySelector('span')?.classList.toggle('icon-[carbon--checkbox]', !pressed);
		button.querySelector('span')?.classList.toggle('icon-[carbon--checkbox-checked]', pressed);
		for (const item of document.querySelectorAll<HTMLElement>('[data-talk-item]')) {
			item.hidden = pressed && item.dataset.lang !== 'en';
		}
		for (const section of document.querySelectorAll<HTMLElement>('[data-talk-year]')) {
			section.hidden = [...section.querySelectorAll<HTMLElement>('[data-talk-item]')].every(
				(item) => item.hidden,
			);
		}
	});
}

function initialiseSponsorViewToggle(): void {
	const sponsorImage = document.querySelector<HTMLImageElement>('[data-sponsor-image]');
	const button = document.querySelector<HTMLButtonElement>('[data-sponsor-view]');
	const status = document.querySelector<HTMLElement>('#sponsor-view-status');
	if (sponsorImage == null || button == null || status == null) {
		return;
	}

	button.addEventListener('click', () => {
		const circles = button.dataset.sponsorView !== 'circles';
		button.dataset.sponsorView = circles ? 'circles' : 'tiers';
		button.textContent = circles ? 'Show Sponsor Tiers' : 'Show Sponsor Circles';
		sponsorImage.src = `https://sponsors.ryoppippi.com/${circles ? 'sponsors.circles.svg' : 'sponsors.past.svg'}`;
		sponsorImage.alt = circles ? 'GitHub Sponsors' : 'Sponsor Tiers';
		status.textContent = circles ? 'Showing Sponsor Circles' : 'Showing Sponsor Tiers';
	});
}

function initialiseMediaFilter(): void {
	const button = document.querySelector<HTMLButtonElement>('[data-media-filter="english"]');
	if (button == null) {
		return;
	}

	button.addEventListener('click', () => {
		const pressed = button.ariaPressed !== 'true';
		button.ariaPressed = String(pressed);
		button.querySelector('span')?.classList.toggle('icon-[carbon--checkbox]', !pressed);
		button.querySelector('span')?.classList.toggle('icon-[carbon--checkbox-checked]', pressed);
		for (const item of document.querySelectorAll<HTMLElement>('[data-media-item]')) {
			item.hidden = pressed && item.dataset.lang !== 'en';
		}
		for (const section of document.querySelectorAll<HTMLElement>('[data-media-year]')) {
			section.hidden = [...section.querySelectorAll<HTMLElement>('[data-media-item]')].every(
				(item) => item.hidden,
			);
		}
	});
}

type SolidIslandModule = { default: (props: Record<string, unknown>) => JSX.Element };

// Every component colocated with a post is a potential island, so the loaders
// are collected by glob rather than listed by hand. Vite keeps each one in its
// own chunk, so a post only downloads the islands it actually uses. The globs
const solidIslandLoaders = import.meta.glob<SolidIslandModule>('../content/blog/**/*.tsx');

let islandController: IslandController | undefined;

async function mountSolidIsland(
	element: HTMLElement,
	load: () => Promise<SolidIslandModule>,
	props: Record<string, unknown>,
): Promise<() => void> {
	const [{ render }, { default: Island }] = await Promise.all([import('@solidjs/web'), load()]);
	// Solid islands are not compiled hydratable, so the server markup is
	// replaced by a fresh client render instead of being adopted.
	const target = element.querySelector<HTMLElement>('[data-ox-island-root]') ?? element;
	target.replaceChildren();
	return render(() => Island(props), target);
}

function initialiseSolidIslands(): void {
	islandController = initIslands((element, props) => {
		const moduleId = element.dataset.oxIsland;
		const load = moduleId == null ? undefined : solidIslandLoaders[`../content/blog/${moduleId}`];
		if (load == null) {
			throw new Error(`Unknown island module: ${moduleId ?? ''}`);
		}

		let dispose: (() => void) | undefined;
		let destroyed = false;
		void mountSolidIsland(element, load, props)
			.then((mountedDispose) => {
				if (destroyed) {
					mountedDispose();
				} else {
					dispose = mountedDispose;
				}
			})
			.catch((error: unknown) => {
				element.classList.add('ox-island-error');
				element.dataset.oxError = error instanceof Error ? error.message : String(error);
			});

		// Loading stays asynchronous so unrelated pages do not download every
		// post-colocated component. Cleanup still has to be synchronously
		// registered with the Ox Content island controller.
		return () => {
			destroyed = true;
			dispose?.();
		};
	});
}

function initialisePageInteractions(): void {
	initialiseThemeToggle();
	initialiseBlogFilters();
	initialiseTalkFilter();
	initialiseMediaFilter();
	initialiseSponsorViewToggle();
	initialiseSolidIslands();
	initReaderChrome(document);
	initTweetCards(document);
	enhanceMarkdownTables(document);
}

function destroyMountedIslands(): void {
	islandController?.destroy();
	islandController = undefined;
}

const pageHeadSelector = [
	'meta[name="description"]',
	'meta[name="robots"]',
	'meta[name="Hatena::Bookmark"]',
	'meta[name^="twitter:"]',
	'meta[property^="og:"]',
	'meta[property^="article:"]',
	'link[rel="canonical"]',
	'link[rel="alternate"][hreflang]',
	'script[type="application/ld+json"]',
].join(',');

function synchroniseDocumentHead(next: Document): void {
	document.title = next.title;
	for (const element of document.head.querySelectorAll(pageHeadSelector)) {
		element.remove();
	}
	for (const element of next.head.querySelectorAll(pageHeadSelector)) {
		document.head.append(element.cloneNode(true));
	}
}

let activeNavigationRequest: AbortController | undefined;

function stylesheetLinks(target: Document): HTMLLinkElement[] {
	return [...target.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')];
}

function stylesheetHrefs(target: Document): string[] {
	return stylesheetLinks(target).map((link) => link.href);
}

async function loadLinkedPageStyles(next: Document): Promise<void> {
	await Promise.all(
		missingPageStyles(stylesheetHrefs(document), stylesheetHrefs(next)).map(
			(href) =>
				new Promise<void>((resolve, reject) => {
					const link = document.createElement('link');
					link.rel = 'stylesheet';
					link.href = href;
					link.addEventListener('load', () => resolve(), { once: true });
					link.addEventListener('error', () => reject(new Error(`Failed to load ${href}`)), {
						once: true,
					});
					document.head.append(link);
				}),
		),
	);
}

function removeObsoletePageStyles(next: Document): void {
	const obsolete = new Set(obsoletePageStyles(stylesheetHrefs(document), stylesheetHrefs(next)));
	for (const link of stylesheetLinks(document)) {
		if (obsolete.has(link.href)) {
			link.remove();
		}
	}
}

function synchroniseInlineStyles(next: Document): void {
	for (const style of document.querySelectorAll(
		'style[data-inline-base-style], style[data-inline-page-style]',
	)) {
		style.remove();
	}
	for (const style of next.querySelectorAll(
		'style[data-inline-base-style], style[data-inline-page-style]',
	)) {
		document.head.append(style.cloneNode(true));
	}
}

function scrollAfterNavigation(url: URL): void {
	const targetId = hashTargetId(url);
	const target = targetId == null ? null : document.getElementById(targetId);
	if (target != null) {
		target.scrollIntoView();
		return;
	}

	window.scrollTo({ top: 0 });
}

async function navigateWithinSite(url: URL, pushHistory: boolean): Promise<void> {
	activeNavigationRequest?.abort();
	activeNavigationRequest = new AbortController();
	const response = await fetch(url, {
		headers: { Accept: 'text/html' },
		signal: activeNavigationRequest.signal,
	});
	if (!response.ok || response.headers.get('content-type')?.includes('text/html') !== true) {
		location.href = url.href;
		return;
	}

	const next = new DOMParser().parseFromString(await response.text(), 'text/html');
	if (next.querySelector('style[data-inline-page-style]') == null) {
		await loadPageStyle(next.body.dataset.pageStyle);
	}
	await loadLinkedPageStyles(next);
	const applyNavigation = () => {
		destroyMountedIslands();
		removeObsoletePageStyles(next);
		synchroniseInlineStyles(next);
		synchroniseDocumentHead(next);
		if (next.body.dataset.pageStyle === 'home') {
			next.body.dataset.spaNavigation = 'true';
		}
		document.body.replaceWith(next.body);
		if (pushHistory) {
			history.pushState({}, '', url);
		}
		initialisePageInteractions();
		scrollAfterNavigation(url);
	};

	if (document.startViewTransition != null) {
		document.startViewTransition(applyNavigation);
	} else {
		applyNavigation();
	}
}

document.addEventListener('click', (event) => {
	if (
		event.defaultPrevented ||
		event.button !== 0 ||
		event.metaKey ||
		event.ctrlKey ||
		event.shiftKey ||
		event.altKey
	) {
		return;
	}
	const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
	if (anchor == null || anchor.target.length > 0 || anchor.hasAttribute('download')) {
		return;
	}
	const url = new URL(anchor.href, location.href);
	if (
		url.origin !== location.origin ||
		url.pathname.endsWith('.md') ||
		url.pathname.endsWith('.xml')
	) {
		return;
	}
	if (url.pathname === location.pathname && url.search === location.search) {
		return;
	}
	event.preventDefault();
	void navigateWithinSite(url, true);
});

window.addEventListener('popstate', () => void navigateWithinSite(new URL(location.href), false));
let markdownTableResizePending = false;
window.addEventListener('resize', () => {
	if (markdownTableResizePending) {
		return;
	}

	markdownTableResizePending = true;
	requestAnimationFrame(() => {
		markdownTableResizePending = false;
		enhanceMarkdownTables(document);
	});
});
const initialPageStyle = document.body.dataset.pageStyle;
const inlinedPageStyle = document.querySelector<HTMLElement>('style[data-inline-page-style]')
	?.dataset.inlinePageStyle;
void (
	needsInitialPageStyle(initialPageStyle, inlinedPageStyle)
		? loadPageStyle(initialPageStyle)
		: Promise.resolve()
).then(initialisePageInteractions);
