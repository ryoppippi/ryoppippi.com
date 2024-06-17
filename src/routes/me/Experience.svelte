<script>
	import ExperienceTitle from './ExperienceTitle.svelte';
	import Timeline from '$lib/Timeline.svelte';
	import TimelineItem from '$lib/TimelineItem.svelte';
	import ChipList from '$lib/ChipList.svelte';

	import IconPajamas from '~icons/pajamas/machine-learning';
	import IconRunning from '~icons/fa-solid/running';
	import IconTeaching from '~icons/mdi/teach-poll';
	import IconCamera from '~icons/mdi/camera';
	import IconLine from '~icons/simple-icons/line';

	/** @type{Record<string, boolean>} */
	let items = {
		Industrial: true,
		Teaching: true,
	};
</script>

<article>
	<div class='flex'><h1
		id='education' class='
			mx-auto
			my-5
			text-3xl

			md:ml-0
		'>Working Experience</h1></div>
	<div class='flex'>
		<div
			class='
				mx-auto
				text-3xl

				md:ml-0
			'>
			<ChipList bind:items />
		</div>
	</div>
	<Timeline>
		<TimelineItem date='Apr 2022 - now' hidden={!items.Industrial} icon={IconRunning}>
			<svelte:fragment slot='title'>
				<ExperienceTitle link={null} place='The University of Tokyo' title='Research Assistant' />
			</svelte:fragment>
		</TimelineItem>
		<TimelineItem date='May 2021 - now' hidden={!items.Teaching} icon={IconTeaching}>
			<svelte:fragment slot='title'>
				<ExperienceTitle link='https://aiacademy.jp' place='AI Academy Inc.' title='Instructor' />
			</svelte:fragment>
		</TimelineItem>
		<TimelineItem date='Jan 2024 - Mar 2024' hidden={!items.Industrial} icon={IconRunning}>
			<svelte:fragment slot='title'>
				<ExperienceTitle link='https://notahotel.com/' place='NOT A HOTEL Inc.' title='Engineer' />
			</svelte:fragment>
		</TimelineItem>
		<TimelineItem date='July 2022 - Aug 2023' hidden={!items.Industrial} icon={IconRunning}>
			<svelte:fragment slot='title'>
				<ExperienceTitle link='https://eightis.co.jp/' place='Eightis Inc.' title='Full-Stack Engineer' />
			</svelte:fragment>
		</TimelineItem>
		<TimelineItem date='Oct 2018 - June 2023' hidden={!items.Industrial} icon={IconPajamas}>
			<svelte:fragment slot='title'>
				<ExperienceTitle
					link='http://qcore.co.jp'
					place='QuantumCore Inc.'
					title='Co-Founder and Chief Research Officer (CRO)' />
			</svelte:fragment>
		</TimelineItem>
		<TimelineItem date='Sep 2018 - Nov 2018' hidden={!items.Teaching} icon={IconTeaching}>
			<svelte:fragment slot='title'>
				<ExperienceTitle link={null} place='International Christian University' title='Teaching Assistant' />
			</svelte:fragment>
			<div slot='main'>ISC104 Foundation of Programming</div>
		</TimelineItem>
		<TimelineItem date='June 2018' hidden={!items.Industrial} icon={IconCamera}>
			<svelte:fragment slot='title'>
				<ExperienceTitle link='https://www.dglab.com/en/' place='DG Lab.' title='Research Internship' />
			</svelte:fragment>
		</TimelineItem>
		<TimelineItem date='Sep 2017 - Apr 2018' hidden={!items.Teaching} icon={IconTeaching}>
			<svelte:fragment slot='title'>
				<ExperienceTitle link={null} place='Japan Society at The University of Edinburgh' title='Teaching Assistant' />
			</svelte:fragment>
		</TimelineItem>
		<TimelineItem date='Aug 2017' hidden={!items.Industrial} icon={IconLine}>
			<svelte:fragment slot='title'>
				<ExperienceTitle link='https://line.me/en/' place='Line Corp.' title='Engineer Internship' />
			</svelte:fragment>
		</TimelineItem>
		<TimelineItem date='June 2016 - Aug 2016' hidden={!items.Teaching} icon={IconTeaching}>
			<svelte:fragment slot='title'>
				<ExperienceTitle link={null} place='International Christian University' title='Culture Staff' />
			</svelte:fragment>
			<div slot='main'>Introduced Japanese culture and Japanese to students learning Japanese</div>
		</TimelineItem>
	</Timeline>
</article>
