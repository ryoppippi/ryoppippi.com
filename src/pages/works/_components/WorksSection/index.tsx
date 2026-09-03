import type { JSX } from '@solidjs/web';
import styles from './WorksSection.module.css';

type WorksSectionProps = {
	children: JSX.Element;
	filter?: 'media' | 'talk';
	title: JSX.Element;
};

type WorksListProps = {
	children: JSX.Element;
};

/**
 * Renders a titled section shared by Works pages.
 *
 * @param props - The section heading, content, and optional filter marker.
 * @returns A Works section.
 */
export default function WorksSection({ children, filter, title }: WorksSectionProps) {
	return (
		<section
			data-media-year={filter === 'media' ? true : undefined}
			data-talk-year={filter === 'talk' ? true : undefined}
		>
			<h2 class={styles.worksYear}>{title}</h2>
			{children}
		</section>
	);
}

/**
 * Renders the consistently indented list used by Works sections.
 *
 * @param props - List items to render.
 * @returns A Works list.
 */
export function WorksList({ children }: WorksListProps) {
	return <ul class={styles.worksList}>{children}</ul>;
}
