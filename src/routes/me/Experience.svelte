<script>
	import Timeline from '$lib/Timeline.svelte';
	import TimelineItem from '$lib/TimelineItem.svelte';
	import ChipList from './ChipList.svelte';

	const linkClass = 'underline hover:no-underline';

	/** @type{Record<string, boolean>} */
	let items = {
		Industrial: true,
		Teaching: true
	};
</script>

<article>
	<h1 class="my-5 text-3xl" id="experience">Working Experience</h1>
	<ChipList bind:items />
	<Timeline>
		<TimelineItem icon="pajamas:machine-learning" date="Oct 2018 - now" hidden={!items.Industrial}>
			<span slot="title">
				Co-Founder and Chief Research Officer (CRO) @ <a href="http://qcore.co.jp" class={linkClass} target="_blank"
					>QuantumCore Inc.</a>
			</span>
		</TimelineItem>
		<TimelineItem icon="fa-solid:running" date="July 2022 - now" hidden={!items.Industrial}>
			<span slot="title">
				Full-Stack Engineer @ <a href="https://eightis.co.jp/" class={linkClass} target="_blank">Eightis Inc.</a>
			</span>
		</TimelineItem>
		<TimelineItem icon="mdi:teach-poll" date="May 2021 - now" hidden={!items.Teaching}>
			<span slot="title">
				Instructor @ <a href="https://aiacademy.jp" class={linkClass} target="_blank">AI Academy Inc.</a>
			</span>
		</TimelineItem>
		<TimelineItem icon="mdi:teach-poll" date="Sep 2018 - Nov 2018" hidden={!items.Teaching}>
			<span slot="title"> Teaching Assistant @ International Christian University </span>
			<span slot="main">ISC104 Foundation of Programming </span>
		</TimelineItem>
		<TimelineItem icon="mdi:camera" date="June 2018" hidden={!items.Industrial}>
			<span slot="title">
				Research Internship @ <a href="https://www.dglab.com/en/" class={linkClass} target="_blank">DG Lab.</a>
			</span>
		</TimelineItem>
		<TimelineItem icon="mdi:teach-poll" date="Sep 2017 - Apr 2018" hidden={!items.Teaching}>
			<span slot="title">Teaching Assistant @ Japan Society at The University of Edinburgh</span>
		</TimelineItem>
		<TimelineItem icon="simple-icons:line" date="Aug 2017" hidden={!items.Industrial}>
			<span slot="title">
				Engineer Internship @ <a href="https://line.me/en/" class={linkClass} target="_blank">Line Corp.</a>
			</span>
		</TimelineItem>
		<TimelineItem icon="mdi:teach-poll" date="June 2016 - Aug 2016" hidden={!items.Teaching}>
			<span slot="title">Culture Staff @ International Christian University </span>
			<span slot="main">Introduced Japanese culture and Japanese to students learning Japanese</span>
		</TimelineItem>
	</Timeline>
</article>
