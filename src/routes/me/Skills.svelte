<script>
	import ProgressBar from './ProgressBar.svelte';

	import IconSvelte from '~icons/simple-icons/svelte';
	import IconReact from '~icons/simple-icons/react';
	import IconAngular from '~icons/simple-icons/angular';

	import IconFlask from '~icons/simple-icons/flask';
	import IconFastAPI from '~icons/simple-icons/fastapi';
	import IconMySQL from '~icons/simple-icons/mysql';
	import IconPostgreSQL from '~icons/simple-icons/postgresql';
	import IconRedis from '~icons/simple-icons/redis';

	import IconTypeScript from '~icons/simple-icons/typescript';
	import IconCSS from '~icons/akar-icons/css-fill';
	import IconPython from '~icons/simple-icons/python';
	import IconZig from '~icons/simple-icons/zig';
	import IconOctave from '~icons/simple-icons/octave';
	import IconJulia from '~icons/simple-icons/julia';
	import IconC from '~icons/simple-icons/c';
	import IconSwift from '~icons/grommet-icons/swift';
	import IconCpp from '~icons/mdi/language-cpp';
	import IconSQL from '~icons/ph/file-sql';
	import IconJava from '~icons/devicon-plain/java';

	import IconNumPy from '~icons/simple-icons/numpy';
	import IconPyTorch from '~icons/simple-icons/pytorch';
	import IconTensorFlow from '~icons/simple-icons/tensorflow';
	import IconOpenAI from '~icons/simple-icons/openai';

	import IconCloudflare from '~icons/simple-icons/cloudflare';
	import IconMicrosoftAzure from '~icons/simple-icons/microsoftazure';
	import IconAmazonAWS from '~icons/simple-icons/amazonaws';

	/** @type {Record<string, boolean>} */
	/* let levels = {
		Expert: true,
		Middle: true,
		'Good w/ ChatGPT': true
	}; */

	/** @satisfies {Record<string, { icon: ConstructorOfATypedSvelteComponent, title: string, value: number }[]>} */
	const contents = /** @type {const} */ {
		'Languages': [
			{ icon: IconTypeScript, title: 'TypeScript', value: 90 },
			{ icon: IconCSS, title: 'CSS', value: 65 },
			{ icon: IconPython, title: 'Python', value: 90 },
			{ icon: IconZig, title: 'Zig', value: 75 },
			{ icon: IconOctave, title: 'Octave', value: 75 },
			{ icon: IconJulia, title: 'Julia', value: 75 },
			{ icon: IconSwift, title: 'Swift', value: 70 },
			{ icon: IconC, title: 'C', value: 70 },
			{ icon: IconCpp, title: 'C++', value: 70 },
			{ icon: IconSQL, title: 'SQL', value: 70 },
			{ icon: IconJava, title: 'Java', value: 66 },
		],
		'Frontend': [
			{ icon: IconSvelte, title: 'Svelte / SvelteKit', value: 96 },
			{ icon: IconReact, title: 'React / Next.js', value: 75 },
			{ icon: IconAngular, title: 'Angular', value: 75 },
		],
		'Backend': [
			{ icon: IconFlask, title: 'Flask', value: 95 },
			{ icon: IconFastAPI, title: 'FastAPI', value: 85 },
			{ icon: IconMySQL, title: 'MySQL', value: 80 },
			{ icon: IconPostgreSQL, title: 'PostgreSQL', value: 80 },
			{ icon: IconRedis, title: 'Redis', value: 75 },
		],
		'Mobile': [
			/**/
			{ icon: IconSwift, title: 'SwiftUI', value: 70 },
		],
		'Machine Learning': [
			{ icon: IconNumPy, title: 'NumPy', value: 99 },
			{ icon: IconPyTorch, title: 'PyTorch', value: 90 },
			{ icon: IconTensorFlow, title: 'TensorFlow', value: 80 },
			{ icon: IconOpenAI, title: 'OpenAI', value: 75 },
		],
		'Cloud': [
			{ icon: IconCloudflare, title: 'Cloudflare', value: 90 },
			{ icon: IconMicrosoftAzure, title: 'Microsoft Azure', value: 80 },
			{ icon: IconAmazonAWS, title: 'Amazon AWS', value: 75 },
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
						<svelte:component this={icon} style='font-size: {1.7}vh' />
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
