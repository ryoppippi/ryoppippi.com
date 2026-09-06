import SiteHeader from './SiteHeader';
import styles from './SiteLayout.module.css';

type SiteLayoutProps = {
	content: string;
	pathname: string;
};

/**
 * Renders the shared site navigation around a page body.
 *
 * @param props - Rendered page content and current pathname.
 * @returns The shared site layout.
 */
export default function SiteLayout({ content, pathname }: SiteLayoutProps) {
	return (
		<>
			<span data-nosnippet>
				<a class={styles.skipLink} href="#main-content">
					Skip to content
				</a>
			</span>
			<div class={styles.siteLayout}>
				<SiteHeader pathname={pathname} />
				<main id="main-content" tabindex="-1" innerHTML={content} />
			</div>
		</>
	);
}
