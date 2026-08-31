import WorksNav from './WorksNav.tsx';

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
				<section>
					<h2 class="f-text-32-64 my-8 font-mono font-bold leading-none text-stroke-aaa text-transparent opacity-35 dark:opacity-20">
						{year}
					</h2>
					<ul class="mx-auto px-10">
						{items.map((item) => (
							<li class="my-5">
								<a
									class="op-card text-xl underline transition-base"
									href={item.link}
									rel="noopener noreferrer"
									target="_blank"
								>
									{item.title}
								</a>
								<p class="opacity-50">{item.publisher}</p>
							</li>
						))}
					</ul>
				</section>
			))}
		</>
	);
}
