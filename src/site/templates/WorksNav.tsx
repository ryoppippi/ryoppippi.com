const sections = ['oss', 'showcase', 'talks', 'media', 'publications'] as const;

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
		<div class="text-center font-mono">
			<h1 class="pb-4 text-5xl font-bold opacity-70">Works</h1>
			<p class="mb-5 text-lg italic opacity-50">
				<span class="text-nowrap">... that</span> <span class="text-nowrap">I</span>{' '}
				<span class="text-nowrap">(&rsquo;m working | &rsquo;ve worked)</span>{' '}
				<span class="text-nowrap">on</span>
			</p>
			<nav class="fcol-sm-row fw mb-8 gap-1 text-3xl sm:gap-3" aria-label="Works sections">
				{sections.map((item) => (
					<a
						class={`transition-base ${item === active ? 'opacity-70' : 'opacity-20'}`}
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
