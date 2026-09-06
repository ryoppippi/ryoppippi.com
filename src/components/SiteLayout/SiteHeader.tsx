import styles from './SiteLayout.module.css';
import NavigationLinks from './NavigationLinks';
import NavigationActions from './NavigationActions';

/** Renders the home-aware brand and the site's primary navigation. */
export default function SiteHeader({ pathname }: { pathname: string }) {
	const isHome = pathname === '/';
	return (
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
				<NavigationLinks pathname={pathname} />
				<NavigationActions />
			</nav>
		</header>
	);
}
