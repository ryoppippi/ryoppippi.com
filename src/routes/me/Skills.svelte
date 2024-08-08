<script>
	import ProgressBar from './ProgressBar.svelte';

	/** @type {Record<string, boolean>} */
	/* let levels = {
		Expert: true,
		Middle: true,
		'Good w/ ChatGPT': true
	}; */

	/** @satisfies {Record<string, { icon: string, title: string, value: number }[]>} */
	const contents = /** @type {const} */ {
		'Languages': [
			{ icon: 'i-simple-icons:typescript', title: 'TypeScript', value: 90 },
			{ icon: 'i-akar-icons:css-fill', title: 'CSS', value: 65 },
			{ icon: 'i-simple-icons:python', title: 'Python', value: 90 },
			{ icon: 'i-simple-icons:zig', title: 'Zig', value: 75 },
			{ icon: 'i-simple-icons:octave', title: 'Octave', value: 75 },
			{ icon: 'i-simple-icons:julia', title: 'Julia', value: 75 },
			{ icon: 'i-grommet-icons:swift', title: 'Swift', value: 70 },
			{ icon: 'i-simple-icons:c', title: 'C', value: 70 },
			{ icon: 'i-mdi:language-cpp', title: 'C++', value: 70 },
			{ icon: 'i-ph:file-sql', title: 'SQL', value: 70 },
			{ icon: 'i-devicon-plain:java', title: 'Java', value: 66 },
		],
		'Frontend': [
			{ icon: 'i-simple-icons:svelte', title: 'Svelte / SvelteKit', value: 96 },
			{ icon: 'i-simple-icons:react', title: 'React / Next.js', value: 75 },
			{ icon: 'i-simple-icons:angular', title: 'Angular', value: 75 },
		],
		'Backend': [
			{ icon: 'i-simple-icons:flask', title: 'Flask', value: 95 },
			{ icon: 'i-simple-icons:fastapi', title: 'FastAPI', value: 85 },
			{ icon: 'i-simple-icons:mysql', title: 'MySQL', value: 80 },
			{ icon: 'i-simple-icons:postgresql', title: 'PostgreSQL', value: 80 },
			{ icon: 'i-simple-icons:redis', title: 'Redis', value: 75 },
		],
		'Mobile': [
			/**/
			{ icon: 'i-grommet-icons:swift', title: 'SwiftUI', value: 70 },
		],
		'Machine Learning': [
			{ icon: 'i-simple-icons:numpy', title: 'NumPy', value: 99 },
			{ icon: 'i-simple-icons:pytorch', title: 'PyTorch', value: 90 },
			{ icon: 'i-simple-icons:tensorflow', title: 'TensorFlow', value: 80 },
			{ icon: 'i-simple-icons:openai', title: 'OpenAI', value: 75 },
		],
		'Cloud': [
			{ icon: 'i-simple-icons:cloudflare', title: 'Cloudflare', value: 90 },
			{ icon: 'i-simple-icons:microsoftazure', title: 'Microsoft Azure', value: 80 },
			{ icon: 'i-simple-icons:amazonaws', title: 'Amazon AWS', value: 75 },
		],
	};

// $: ({ Expert: expert, Middle: middle, 'Good w/ ChatGPT': good } = levels);
</script>

<article class='mx-6 md:mx-0'>
	<div class='flex'><h1 id='education' class='mx-auto my-5 text-3xl md:ml-0'>Computing Skills</h1></div>

	<!-- <ChipList bind:items={levels} /> -->

	{#each Object.entries(contents) as [category, items] (category)}
		<h2 class='h2'>{category}</h2>
		<dl class='list-dl mb-2'>
			{#each items as { icon, title, value } (title)}
				<div>
					<span class='flex h-10 w-10 items-center justify-center rounded-full bg-me-primary-200 ring-8 ring-gray-900'>
						<!-- svelte-ignore element_invalid_self_closing_tag -->
						<div this={icon} style:font-size='{1.7}vh' />
					</span>
					<span class='flex-auto'>
						<dt class='mb-1'>{title}</dt>
						<dd class='flex'>
							<ProgressBar class='max-w-[90%]' label='Progress Bar' max={100} {value} />
							<span>{value}%</span>
						</dd>
					</span>
				</div>
			{/each}
		</dl>
	{/each}
</article>
