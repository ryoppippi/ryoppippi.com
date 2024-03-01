<script>
	import Timeline from '$lib/Timeline.svelte';
	import TimelineItem from '$lib/TimelineItem.svelte';
	import ChipList from '$lib/ChipList.svelte';
	import ExperienceTitle from './ExperienceTitle.svelte';

	import IconPajamas from '~icons/pajamas/machine-learning';
	import IconRunning from '~icons/fa-solid/running';
	import IconTeaching from '~icons/mdi/teach-poll';
	import IconCamera from '~icons/mdi/camera';
	import IconLine from '~icons/simple-icons/line';

	/** @type{Record<string, boolean>} */
	let items = {
		Industrial: true,
		Teaching: true
	};
</script>

<article>
	<div class="flex"><h1 class=" mx-auto my-5 text-3xl md:ml-0" id="education">Working Experience</h1></div>
	<div class="flex">
		<div class=" mx-auto text-3xl md:ml-0">
			<ChipList bind:items />
		</div>
	</div>
	<Timeline>
		<TimelineItem icon={IconRunning} date="Apr 2022 - now" hidden={!items.Industrial}>
			<svelte:fragment slot="title">
				<ExperienceTitle title="Research Assistant" place="The University of Tokyo" />
			</svelte:fragment>
		</TimelineItem>
		<TimelineItem icon={IconTeaching} date="May 2021 - now" hidden={!items.Teaching}>
			<svelte:fragment slot="title">
				<ExperienceTitle title="Instructor" place="AI Academy Inc." link="https://aiacademy.jp" />
			</svelte:fragment>
		</TimelineItem>
		<TimelineItem icon={IconRunning} date="Jan 2024 - Mar 2024" hidden={!items.Industrial}>
			<svelte:fragment slot="title">
				<ExperienceTitle title="Engineer" place="NOT A HOTEL Inc." link="https://notahotel.com/" />
			</svelte:fragment>
		</TimelineItem>
		<TimelineItem icon={IconRunning} date="July 2022 - Aug 2023" hidden={!items.Industrial}>
			<svelte:fragment slot="title">
				<ExperienceTitle title="Full-Stack Engineer" place="Eightis Inc." link="https://eightis.co.jp/" />
			</svelte:fragment>
		</TimelineItem>
		<TimelineItem icon={IconPajamas} date="Oct 2018 - June 2023" hidden={!items.Industrial}>
			<svelte:fragment slot="title">
				<ExperienceTitle
					title="Co-Founder and Chief Research Officer (CRO)"
					place="QuantumCore Inc."
					link="http://qcore.co.jp" />
			</svelte:fragment>
		</TimelineItem>
		<TimelineItem icon={IconTeaching} date="Sep 2018 - Nov 2018" hidden={!items.Teaching}>
			<svelte:fragment slot="title">
				<ExperienceTitle title="Teaching Assistant" place="International Christian University" />
			</svelte:fragment>
			<div slot="main">ISC104 Foundation of Programming</div>
		</TimelineItem>
		<TimelineItem icon={IconCamera} date="June 2018" hidden={!items.Industrial}>
			<svelte:fragment slot="title">
				<ExperienceTitle title="Research Internship" place="DG Lab." link="https://www.dglab.com/en/" />
			</svelte:fragment>
		</TimelineItem>
		<TimelineItem icon={IconTeaching} date="Sep 2017 - Apr 2018" hidden={!items.Teaching}>
			<svelte:fragment slot="title">
				<ExperienceTitle title="Teaching Assistant" place="Japan Society at The University of Edinburgh" />
			</svelte:fragment>
		</TimelineItem>
		<TimelineItem icon={IconLine} date="Aug 2017" hidden={!items.Industrial}>
			<svelte:fragment slot="title">
				<ExperienceTitle title="Engineer Internship" place="Line Corp." link="https://line.me/en/" />
			</svelte:fragment>
		</TimelineItem>
		<TimelineItem icon={IconTeaching} date="June 2016 - Aug 2016" hidden={!items.Teaching}>
			<svelte:fragment slot="title">
				<ExperienceTitle title="Culture Staff" place="International Christian University" />
			</svelte:fragment>
			<div slot="main">Introduced Japanese culture and Japanese to students learning Japanese</div>
		</TimelineItem>
	</Timeline>
</article>
