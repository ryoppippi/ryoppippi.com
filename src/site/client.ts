import type { JSX } from 'solid-js';
import type { Component } from 'svelte';
import '../styles/fonts.css';
import {
	loadPageStyle,
	missingPageStyles,
	needsInitialPageStyle,
	obsoletePageStyles,
} from './page-styles.ts';
import { hashTargetId } from './navigation.ts';
import { enhanceMarkdownTables } from './markdown-tables.ts';
import './style.css';

/**
 * Runs an action with all CSS transitions disabled so colour-scheme changes
 * apply instantly instead of tweening element by element.
 *
 * @see https://reemus.dev/article/disable-css-transition-color-scheme-change
 */
function withoutTransition(action: () => void): void {
	const style = document.createElement('style');
	style.textContent = '* { transition: none !important; }';
	document.head.append(style);
	action();
	// Reading a computed style forces a repaint while transitions are still disabled
	void window.getComputedStyle(style).opacity;
	style.remove();
}

/**
 * Applies a theme change with a circular reveal that expands from the given
 * point, ported from svelte-fancy-darkmode.
 *
 * Credit to [@hooray](https://github.com/hooray)
 * @see https://github.com/vuejs/vitepress/pull/2347
 * @see https://github.com/ryoppippi/svelte-fancy-darkmode
 */
function animateThemeChange(x: number, y: number, apply: () => void): void {
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (document.startViewTransition == null || prefersReducedMotion) {
		apply();
		return;
	}

	// The reveal circle grows from the given point to the furthest viewport corner
	const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

	const transition = document.startViewTransition(apply);
	void transition.ready.then(() =>
		withoutTransition(() => {
			const dark = document.documentElement.classList.contains('dark');
			const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`];
			// Switching to dark shrinks the old light view into the click point;
			// switching to light grows the new light view out of it. The z-index
			// rules in style.css keep the animated snapshot on top in both cases.
			// fill: 'forwards' holds the final clip-path after the animation ends,
			// otherwise the unclipped old snapshot flashes for one frame before the
			// view transition is torn down.
			const animation = document.documentElement.animate(
				{ clipPath: dark ? [...clipPath].reverse() : clipPath },
				{
					duration: 400,
					easing: 'ease-out',
					fill: 'forwards',
					pseudoElement: dark ? '::view-transition-old(root)' : '::view-transition-new(root)',
				},
			);
			// Remove the finished animation so a later transition cannot reuse its final clip-path.
			void Promise.all([transition.finished, animation.finished]).then(
				() => animation.cancel(),
				() => undefined,
			);
		}),
	);
}

function initialiseDarkMode(): void {
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
		animateThemeChange(event.clientX, event.clientY, () => {
			const dark = document.documentElement.classList.toggle('dark');
			document.documentElement.dataset.theme = dark ? 'dark' : 'light';
			localStorage.theme = dark ? 'dark' : 'light';
			render();
		});
	});
	render();
}

function initialiseFilters(): void {
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
			for (const item of document.querySelectorAll<HTMLElement>('.blog-item')) {
				item.hidden =
					(english && item.dataset.lang !== 'en') || (local && item.dataset.origin !== 'local');
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
		for (const item of document.querySelectorAll<HTMLElement>('.talk-item')) {
			item.hidden = pressed && item.dataset.lang !== 'en';
		}
		for (const section of document.querySelectorAll<HTMLElement>('[data-talk-year]')) {
			section.hidden = [...section.querySelectorAll<HTMLElement>('.talk-item')].every(
				(item) => item.hidden,
			);
		}
	});
}

function initialiseSponsors(): void {
	const sponsorImage = document.querySelector<HTMLImageElement>('[data-sponsor-image]');
	for (const button of document.querySelectorAll<HTMLButtonElement>('[data-sponsor-view]')) {
		button.addEventListener('click', () => {
			if (sponsorImage == null) {
				return;
			}
			const circles = button.dataset.sponsorView === 'circles';
			sponsorImage.src = `https://sponsors.ryoppippi.com/${circles ? 'sponsors.circles.svg' : 'sponsors.past.svg'}`;
			sponsorImage.alt = circles ? 'GitHub Sponsors' : 'Sponsor Tiers';
			for (const candidate of document.querySelectorAll<HTMLElement>('[data-sponsor-view]')) {
				candidate.classList.toggle('opacity-70', candidate === button);
				candidate.classList.toggle('opacity-20', candidate !== button);
				candidate.ariaPressed = String(candidate === button);
			}
		});
	}
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
		for (const item of document.querySelectorAll<HTMLElement>('.media-item')) {
			item.hidden = pressed && item.dataset.lang !== 'en';
		}
		for (const section of document.querySelectorAll<HTMLElement>('[data-media-year]')) {
			section.hidden = [...section.querySelectorAll<HTMLElement>('.media-item')].every(
				(item) => item.hidden,
			);
		}
	});
}

type SvelteIslandModule = { default: Component<Record<string, unknown>> };
type SolidIslandModule = { default: (props: Record<string, unknown>) => JSX.Element };

// Every component colocated with a post is a potential island, so the loaders
// are collected by glob rather than listed by hand. Vite keeps each one in its
// own chunk, so a post only downloads the islands it actually uses. The globs
// are split per framework because the file extension decides how a module is
// mounted.
const svelteIslandLoaders = import.meta.glob<SvelteIslandModule>(
	'../../packages/content/src/blog/**/*.svelte',
);
const solidIslandLoaders = import.meta.glob<SolidIslandModule>(
	'../../packages/content/src/blog/**/*.tsx',
);

const islandCleanups = new Set<() => void>();

async function mountSvelteIsland(
	element: HTMLElement,
	load: () => Promise<SvelteIslandModule>,
	props: Record<string, unknown>,
): Promise<void> {
	const [{ hydrate, mount, unmount }, { default: Island }] = await Promise.all([
		import('svelte'),
		load(),
	]);
	// Server-rendered islands carry a root element to adopt. Without one the
	// component was never rendered on the server, so mount it fresh.
	const root = element.querySelector<HTMLElement>('[data-ox-island-root]');
	const instance =
		root == null
			? mount(Island, { target: element, props })
			: hydrate(Island, { target: root, props });
	islandCleanups.add(() => unmount(instance));
}

async function mountSolidIsland(
	element: HTMLElement,
	load: () => Promise<SolidIslandModule>,
	props: Record<string, unknown>,
): Promise<void> {
	const [{ render }, { default: Island }] = await Promise.all([import('solid-js/web'), load()]);
	// Solid islands are not compiled hydratable, so the server markup is
	// replaced by a fresh client render instead of being adopted.
	const target = element.querySelector<HTMLElement>('[data-ox-island-root]') ?? element;
	target.replaceChildren();
	const dispose = render(() => Island(props), target);
	islandCleanups.add(dispose);
}

function islandProps(element: HTMLElement): Record<string, unknown> {
	const serialised = element.dataset.oxProps;
	if (serialised == null) {
		return {};
	}

	const parsed: unknown = JSON.parse(serialised);
	if (parsed == null || typeof parsed !== 'object' || Array.isArray(parsed)) {
		return {};
	}

	const payload = parsed as Record<string, unknown>;
	const props = payload.props;
	return props != null && typeof props === 'object' && !Array.isArray(props)
		? (props as Record<string, unknown>)
		: payload;
}

async function mountIsland(element: HTMLElement): Promise<void> {
	const moduleId = element.dataset.oxIsland;
	if (moduleId == null || element.dataset.oxMounted === 'true') {
		return;
	}

	element.dataset.oxMounted = 'true';
	try {
		const modulePath = `../../packages/content/src/blog/${moduleId}`;
		const props = islandProps(element);
		if (moduleId.endsWith('.tsx')) {
			const load = solidIslandLoaders[modulePath];
			if (load == null) {
				element.dataset.oxMounted = 'false';
				return;
			}
			await mountSolidIsland(element, load, props);
		} else {
			const load = svelteIslandLoaders[modulePath];
			if (load == null) {
				element.dataset.oxMounted = 'false';
				return;
			}
			await mountSvelteIsland(element, load, props);
		}
	} catch {
		element.dataset.oxMounted = 'false';
	}
}

function initialiseIslands(): void {
	for (const element of document.querySelectorAll<HTMLElement>('[data-ox-island]')) {
		void mountIsland(element);
	}
}

function initialisePage(): void {
	initialiseDarkMode();
	initialiseFilters();
	initialiseTalkFilter();
	initialiseMediaFilter();
	initialiseSponsors();
	initialiseIslands();
	enhanceMarkdownTables(document);
}

function destroyPage(): void {
	for (const cleanup of islandCleanups) {
		cleanup();
	}

	islandCleanups.clear();
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

function syncHead(next: Document): void {
	document.title = next.title;
	for (const element of document.head.querySelectorAll(pageHeadSelector)) {
		element.remove();
	}
	for (const element of next.head.querySelectorAll(pageHeadSelector)) {
		document.head.append(element.cloneNode(true));
	}
}

let navigation: AbortController | undefined;

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

function syncInlineStyles(next: Document): void {
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

async function navigate(url: URL, push: boolean): Promise<void> {
	navigation?.abort();
	navigation = new AbortController();
	const response = await fetch(url, {
		headers: { Accept: 'text/html' },
		signal: navigation.signal,
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
	const update = () => {
		destroyPage();
		removeObsoletePageStyles(next);
		syncInlineStyles(next);
		syncHead(next);
		if (next.body.dataset.pageStyle === 'home') {
			next.body.dataset.spaNavigation = 'true';
		}
		document.body.replaceWith(next.body);
		if (push) {
			history.pushState({}, '', url);
		}
		initialisePage();
		scrollAfterNavigation(url);
	};

	if (document.startViewTransition != null) {
		document.startViewTransition(update);
	} else {
		update();
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
	void navigate(url, true);
});

window.addEventListener('popstate', () => void navigate(new URL(location.href), false));
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
const initialStyle = document.body.dataset.pageStyle;
const inlineStyle = document.querySelector<HTMLElement>('style[data-inline-page-style]')?.dataset
	.inlinePageStyle;
void (
	needsInitialPageStyle(initialStyle, inlineStyle) ? loadPageStyle(initialStyle) : Promise.resolve()
).then(initialisePage);
