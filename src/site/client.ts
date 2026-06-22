import type { TweetData } from '@ryoppippi/content';
import '../styles/fonts.css';
import { loadPageStyle, missingPageStyles, obsoletePageStyles } from './page-styles.ts';
import './style.css';

const tweetCleanups = new Set<() => Promise<void>>();

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
	button.addEventListener('click', () => {
		const dark = document.documentElement.classList.toggle('dark');
		localStorage.theme = dark ? 'dark' : 'light';
		render();
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

async function hydrateTweet(element: HTMLElement): Promise<void> {
	const id = element.dataset.tweetId;
	const root = element.querySelector<HTMLElement>('[data-tweet-root]');
	const data = element.querySelector<HTMLScriptElement>('[data-tweet-props]')?.textContent;
	if (id == null || root == null || data == null) {
		return;
	}

	try {
		const tweet = JSON.parse(data) as TweetData;
		const [{ hydrate, unmount }, { default: Tweet }] = await Promise.all([
			import('svelte'),
			import('@ryoppippi/content/Tweet.svelte'),
		]);
		const instance = hydrate(Tweet, { target: root, props: { id, tweet } });
		element.dataset.hydrated = 'true';
		tweetCleanups.add(() => unmount(instance));
	} catch {
		element.dataset.hydrated = 'false';
	}
}

function initialiseTweets(): void {
	const tweets = [...document.querySelectorAll<HTMLElement>('[data-tweet-id]')];
	if (tweets.length === 0) {
		return;
	}

	const start = () => {
		if (!('IntersectionObserver' in window)) {
			for (const tweet of tweets) {
				void hydrateTweet(tweet);
			}
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						observer.unobserve(entry.target);
						void hydrateTweet(entry.target as HTMLElement);
					}
				}
			},
			{ rootMargin: '400px' },
		);
		for (const tweet of tweets) {
			observer.observe(tweet);
		}
	};

	if ('requestIdleCallback' in window) {
		window.requestIdleCallback(start);
	} else {
		setTimeout(start, 1);
	}
}

function initialisePage(): void {
	initialiseDarkMode();
	initialiseFilters();
	initialiseTalkFilter();
	initialiseSponsors();
	initialiseTweets();
}

function destroyPage(): void {
	for (const cleanup of tweetCleanups) {
		void cleanup();
	}
	tweetCleanups.clear();
}

function syncHead(next: Document): void {
	document.title = next.title;
	for (const element of document.head.querySelectorAll('[data-page-head]')) {
		element.remove();
	}
	for (const element of next.head.querySelectorAll('[data-page-head]')) {
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
	await loadPageStyle(next.body.dataset.pageStyle);
	await loadLinkedPageStyles(next);
	const update = () => {
		destroyPage();
		removeObsoletePageStyles(next);
		syncHead(next);
		document.body.replaceWith(next.body);
		if (push) {
			history.pushState({}, '', url);
		}
		initialisePage();
		window.scrollTo({ top: 0 });
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
void loadPageStyle(document.body.dataset.pageStyle).then(initialisePage);
