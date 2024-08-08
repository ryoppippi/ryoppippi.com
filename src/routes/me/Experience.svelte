<script>
	import ExperienceTitle from './ExperienceTitle.svelte';
	import Timeline from '$lib/Timeline.svelte';
	import TimelineItem from '$lib/TimelineItem.svelte';
	import ChipList from '$lib/ChipList.svelte';

	/** @type{Record<string, boolean>} */
	let items = {
		Industrial: true,
		Teaching: true,
	};
</script>

<article>
	<div class='flex'><h1 id='education' class=' mx-auto my-5 text-3xl md:ml-0'>Working Experience</h1></div>
	<div class='flex'>
		<div class=' mx-auto text-3xl md:ml-0'>
			<ChipList bind:items />
		</div>
	</div>
	<Timeline>
		<TimelineItem date='Apr 2022 - now' hidden={!items.Industrial} icon='i-fa-solid:running'>
			{#snippet titleSlot()}
				<ExperienceTitle place='The University of Tokyo' title='Research Assistant' />
			{/snippet}
		</TimelineItem>
		<TimelineItem date='May 2021 - now' hidden={!items.Teaching} icon='i-mdi:teach-poll'>
			{#snippet titleSlot()}
				<ExperienceTitle link='https://aiacademy.jp' place='AI Academy Inc.' title='Instructor' />
			{/snippet}
		</TimelineItem>
		<TimelineItem date='Jan 2024 - Mar 2024' hidden={!items.Industrial} icon='i-fa-solid:running'>
			{#snippet titleSlot()}
				<ExperienceTitle link='https://notahotel.com/' place='NOT A HOTEL Inc.' title='Engineer' />
			{/snippet}
		</TimelineItem>
		<TimelineItem date='July 2022 - Aug 2023' hidden={!items.Industrial} icon='i-fa-solid:running'>
			{#snippet titleSlot()}
				<ExperienceTitle link='https://eightis.co.jp/' place='Eightis Inc.' title='Full-Stack Engineer' />
			{/snippet}
		</TimelineItem>
		<TimelineItem date='Oct 2018 - June 2023' hidden={!items.Industrial} icon='i-pajamas:machine-learning'>
			{#snippet titleSlot()}
				<ExperienceTitle
					link='http://qcore.co.jp'
					place='QuantumCore Inc.'
					title='Co-Founder and Chief Research Officer (CRO)' />
			{/snippet}
		</TimelineItem>
		<TimelineItem date='Sep 2018 - Nov 2018' hidden={!items.Teaching} icon='i-mdi:teach-poll'>
			{#snippet titleSlot()}
				<ExperienceTitle place='International Christian University' title='Teaching Assistant' />
			{/snippet}
			{#snippet mainSlot()}
				ISC104 Foundation of Programming
			{/snippet}
		</TimelineItem>
		<TimelineItem date='June 2018' hidden={!items.Industrial} icon='i-mdi:camera'>
			{#snippet titleSlot()}
				<ExperienceTitle link='https://www.dglab.com/en/' place='DG Lab.' title='Research Internship' />
			{/snippet}
		</TimelineItem>
		<TimelineItem date='Sep 2017 - Apr 2018' hidden={!items.Teaching} icon='i-mdi:teach-poll'>
			{#snippet titleSlot()}
				<ExperienceTitle place='Japan Society at The University of Edinburgh' title='Teaching Assistant' />
			{/snippet}
		</TimelineItem>
		<TimelineItem date='Aug 2017' hidden={!items.Industrial} icon='i-simple-icons:line'>
			{#snippet titleSlot()}
				<ExperienceTitle link='https://line.me/en/' place='Line Corp.' title='Engineer Internship' />
			{/snippet}
		</TimelineItem>
		<TimelineItem date='June 2016 - Aug 2016' hidden={!items.Teaching} icon='i-mdi:teach-poll'>
			{#snippet titleSlot()}
				<ExperienceTitle place='International Christian University' title='Culture Staff' />
			{/snippet}
			{#snippet mainSlot()}
				Introduced Japanese culture and Japanese to students learning Japanese
			{/snippet}
		</TimelineItem>
	</Timeline>
</article>
