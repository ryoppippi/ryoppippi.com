import styles from './SiteLayout.module.css';

/** Renders CV and site tools while preserving the client theme-control mount point. */
export default function NavigationActions() {
	return (
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
	);
}
