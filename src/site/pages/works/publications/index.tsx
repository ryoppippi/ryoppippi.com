import WorksNav from '../_components/WorksNav/index.tsx';
import WorksSection, { WorksList } from '../_components/WorksSection/index.tsx';
import styles from './Publications.module.css';

type Publication = {
	authors: string;
	link: string;
	publisher: string;
	title: string;
};

type PublicationsProps = {
	publications: Record<string, Publication[]>;
};

/**
 * Renders publications grouped by year.
 *
 * @param props - Publications keyed by year.
 * @returns The publications page fragment.
 */
export default function Publications({ publications }: PublicationsProps) {
	const years = Object.entries(publications).sort(([a], [b]) => Number(b) - Number(a));

	return (
		<>
			<WorksNav active="publications" />
			{years.map(([year, items]) => (
				<WorksSection title={year}>
					<WorksList>
						{items.map((item) => (
							<li class={styles.publicationItem}>
								<a
									class={styles.publicationLink}
									href={item.link}
									rel="noopener noreferrer"
									target="_blank"
								>
									{item.title}
								</a>
								<p class={styles.publicationPublisher}>{item.publisher}</p>
							</li>
						))}
					</WorksList>
				</WorksSection>
			))}
		</>
	);
}
