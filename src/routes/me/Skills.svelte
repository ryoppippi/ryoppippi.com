<script>
	import ChipList from './ChipList.svelte';
	import SkillsItem from './SkillsItem.svelte';

	/** @type {Record<string, boolean>} */
	let levels = {
		Expert: true,
		Middle: true,
		'Good w/ ChatGPT': true
	};
	$: ({ Expert: expert, Middle: middle, 'Good w/ ChatGPT': good } = levels);
</script>

<article>
	<h1 class="my-5 text-3xl" id="experience">Computing Skills</h1>
	<!-- <ChipList bind:items={levels} /> -->

	<h2 class="h2">Frontend</h2>
	<dl class="list-dl">
		<SkillsItem icon="simple-icons:svelte" title="Svelte / SvelteKit" value={96} />
		<SkillsItem icon="simple-icons:react" title="React" value={50} />
		<SkillsItem icon="simple-icons:angular" title="Angular" value={75} />
	</dl>

	<h2 class="h2">Backend</h2>
	<dl class="list-dl">
		<SkillsItem icon="simple-icons:flask" title="Flask" value={95} />
		<SkillsItem icon="simple-icons:fastapi" title="FastAPI" value={85} />
		<SkillsItem icon="simple-icons:mysql" title="MySQL" value={80} />
		<SkillsItem icon="simple-icons:postgresql" title="PostgreSQL" value={80} />
		<SkillsItem icon="simple-icons:redis" title="Redis" value={75} />
	</dl>

	<h2 class="h2">Languages</h2>
	<dl class="list-dl">
		<SkillsItem icon="simple-icons:typescript" title="TypeScript" value={90} />
		<SkillsItem icon="akar-icons:css-fill" title="CSS" value={65} />
		<SkillsItem icon="simple-icons:python" title="Python" value={90} />
		<SkillsItem icon="simple-icons:zig" title="Zig" value={75} />
		<SkillsItem icon="simple-icons:octave" title="Octave" value={75} />
		<SkillsItem icon="simple-icons:julia" title="Julia" value={75} />
		<SkillsItem icon="simple-icons:c" title="C" value={70} />
		<SkillsItem icon="mdi:language-cpp" title="C++" value={70} />
		<SkillsItem icon="ph:file-sql" title="SQL" value={70} />
		<SkillsItem icon="simple-icons:java" title="Java" value={66} />
		<SkillsItem icon="simple-icons:go" title="Go" value={50} />
		<SkillsItem icon="simple-icons:rust" title="Rust" value={50} />
	</dl>

	<h2 class="h2">Machine Learning</h2>
	<dl class="list-dl">
		<SkillsItem icon="simple-icons:numpy" title="NumPy" value={99} />
		<SkillsItem icon="simple-icons:pytorch" title="PyTorch" value={90} />
		<SkillsItem icon="simple-icons:tensorflow" title="TensorFlow" value={80} />
		<SkillsItem icon="simple-icons:openai" title="OpenAI API" value={80} />
	</dl>

	<h2 class="h2">Cloud</h2>
	<dl class="list-dl">
		<SkillsItem icon="simple-icons:cloudflare" title="Cloudflare" value={80} />
		<SkillsItem icon="simple-icons:microsoftazure" title="Azure" value={80} />
		<SkillsItem icon="simple-icons:amazonaws" title="AWS" value={50} />
	</dl>
</article>
