import styles from './Shell.module.css';

type ShellProps = {
	content: string;
	pathname: string;
};

type NavigationLink = {
	activePrefix?: string;
	href: string;
	label: string;
};

const links = [
	{ href: '/about/', label: 'about' },
	{ href: '/works/oss/', label: 'works', activePrefix: '/works/' },
	{ href: '/sponsors/', label: 'sponsors' },
	{ href: '/blog/', label: 'blog' },
] as const satisfies readonly NavigationLink[];

/**
 * Renders the shared site navigation around a page body.
 *
 * @param props - Rendered page content and current pathname.
 * @returns The shared page shell.
 */
export default function Shell({ content, pathname }: ShellProps) {
	const isHome = pathname === '/';

	return (
		<>
			<span data-nosnippet>
				<a class={styles.skipLink} href="#main-content">
					Skip to content
				</a>
			</span>
			<div class={styles.siteFrame}>
				<header class={styles.siteHeader}>
					<div
						data-nosnippet
						class={`${styles.siteBrandSlot}${isHome ? ` ${styles.siteBrandSlotHome}` : ''}`}
					>
						{!isHome && (
							<a class={styles.siteBrand} aria-label="Home" href="/">
								<span style="view-transition-name:title-ryoppippi">@ryoppippi</span>
							</a>
						)}
					</div>
					<nav class={styles.siteNavigation} aria-label="Primary navigation">
						<div data-nosnippet class={styles.siteNavigationLinks}>
							{links.map((link) => {
								const active = pathname.startsWith(
									'activePrefix' in link ? link.activePrefix : link.href,
								);
								return (
									<a
										class={styles.siteNavigationLink}
										aria-current={active ? 'page' : undefined}
										href={link.href}
									>
										<span>{link.label}</span>
										<span
											class={`${styles.siteNavigationMarker}${active ? ` ${styles.siteNavigationMarkerActive}` : ''}`}
										/>
									</a>
								);
							})}
						</div>
						<div data-nosnippet class={styles.siteNavigationActions}>
							<a class={styles.siteCvLink} href="/cv" rel="noopener noreferrer" target="_blank">
								<span class={styles.siteCvLabel}>
									cv{' '}
									<span
										class={`icon-[line-md--download-outline] ${styles.siteCvIcon}`}
										aria-hidden="true"
									/>
								</span>
							</a>
							<div class={styles.siteTools}>
								<span class={styles.siteThemeControl} data-dark-mode />
								<a class={styles.siteToolLink} aria-label="RSS feed" href="/feed.xml">
									<span class="icon-[line-md--rss]" aria-hidden="true" />
									<span class={styles.visuallyHidden}>RSS feed</span>
								</a>
								<a
									class={styles.siteToolLink}
									aria-label="Source code on GitHub"
									href="https://github.com/ryoppippi/ryoppippi.com"
									rel="noopener noreferrer"
									target="_blank"
								>
									<span class="icon-[teenyicons--github-solid]" aria-hidden="true" />
									<span class={styles.visuallyHidden}>Source code</span>
								</a>
							</div>
						</div>
					</nav>
				</header>
				<main id="main-content" tabindex="-1" innerHTML={content} />
			</div>
		</>
	);
}
