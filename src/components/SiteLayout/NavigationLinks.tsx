import styles from './SiteLayout.module.css';

type NavigationLink = {
	activePrefix?: string;
	href: string;
	label: string;
};

const navigationLinks = [
	{ href: '/about/', label: 'about' },
	{ href: '/works/oss/', label: 'works', activePrefix: '/works/' },
	{ href: '/sponsors/', label: 'sponsors' },
	{ href: '/blog/', label: 'blog' },
] as const satisfies readonly NavigationLink[];

/** Renders primary links with the current page's active marker. */
export default function NavigationLinks({ pathname }: { pathname: string }) {
	return (
		<div data-nosnippet class={styles.siteNavigationLinks}>
			{navigationLinks.map((link) => {
				const active = pathname.startsWith('activePrefix' in link ? link.activePrefix : link.href);
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
	);
}
