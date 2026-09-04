import styles from './WorksNav.module.css';

const sections = ['oss', 'showcase', 'talks', 'media', 'publications'] as const satisfies readonly [
	string,
	...string[],
];

/** Props for the shared Works navigation. */
export type WorksNavProps = {
	active: (typeof sections)[number];
};

/**
 * Renders navigation between Works sections.
 *
 * @param props - The active Works section.
 * @returns The Works navigation fragment.
 */
export default function WorksNav({ active }: WorksNavProps) {
	return (
		<div class={styles.worksNavigationHeader}>
			<h1 class={styles.worksTitle}>Works</h1>
			<p class={styles.worksTagline}>
				<span class={styles.worksNowrap}>... that</span> <span class={styles.worksNowrap}>I</span>{' '}
				<span class={styles.worksNowrap}>(&rsquo;m working | &rsquo;ve worked)</span>{' '}
				<span class={styles.worksNowrap}>on</span>
			</p>
			<nav class={styles.worksSections} aria-label="Works sections">
				{sections.map((item) => (
					<a
						class={`${styles.worksSectionLink}${item === active ? ` ${styles.worksSectionLinkActive}` : ''}`}
						aria-current={item === active ? 'page' : undefined}
						href={`/works/${item}/`}
						style={`view-transition-name:works-nav-${item}`}
					>
						{item === 'oss' ? 'OSS' : item[0].toUpperCase() + item.slice(1)}
					</a>
				))}
			</nav>
		</div>
	);
}
