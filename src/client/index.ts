import type { JSX } from '@solidjs/web';
import { initIslands } from '@ox-content/islands';
import {
	initSolidHtmlHost,
	type SolidHtmlHostClientContext,
} from '@ox-content/vite-plugin-solid/html-host/client';
import solidIslandLoaders from 'virtual:ox-content-solid/html-host/modules';
import { enhanceMarkdownTables } from '@ox-content/vite-plugin/markdown-tables';
import { initReaderChrome } from '@ox-content/vite-plugin/reader-chrome/client';
import { setThemeBootstrapPreference } from '@ox-content/vite-plugin/theme-bootstrap';
import { applyThemeTransition } from '@ox-content/vite-plugin/theme-transition/client';
import { initTweetCards } from '@ox-content/vite-plugin/twitter/client';
import { loadPageStyle, needsInitialPageStyle } from './page-style-loader.ts';
import '@/styles/global.css';

// SiteLayout is rendered only by the SSG, so this dynamic entry exposes its CSS to
// the manifest used to generate a blocking stylesheet link.
void import('@/components/SiteLayout/SiteLayout.module.css');

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
				setThemeBootstrapPreference(dark ? 'dark' : 'light');
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
type SolidIslandRuntime = typeof import('@solidjs/web');

/**
 * Mounts a loaded Solid island into its HTML-host element.
 *
 * @param context - Loaded component, runtime, props, slot markup, and target element.
 * @returns The Solid root disposer.
 */
export function mountSolidIsland({
	component,
	element,
	props,
	runtime,
	slotHtml,
}: Pick<
	SolidHtmlHostClientContext<SolidIslandRuntime>,
	'component' | 'element' | 'props' | 'runtime' | 'slotHtml'
>): () => void {
	if (typeof component !== 'function' || runtime == null) {
		throw new Error('Expected a Solid component and renderer');
	}
	const Island = component as SolidIslandModule['default'];
	const componentProps =
		slotHtml == null
			? props
			: {
					...props,
					children: [...document.createRange().createContextualFragment(slotHtml).childNodes],
				};
	return runtime.render(() => runtime.createComponent(Island, componentProps), element);
}

function initialiseSolidIslands(): void {
	initSolidHtmlHost({
		initIslands,
		modules: solidIslandLoaders,
		loadRuntime: () => import('@solidjs/web'),
		// This site compiles non-hydratable Solid; the host clears SSR markup before mounting.
		render: mountSolidIsland,
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
