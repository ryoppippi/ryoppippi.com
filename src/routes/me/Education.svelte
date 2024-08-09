<script>
	import Timeline from '$lib/Timeline.svelte';
	import TimelineItem from '$lib/TimelineItem.svelte';
</script>

<article class="">
	<div class='flex'><h1 id='education' class='mx-auto my-5 text-3xl md:ml-0'>Education</h1></div>
	<Timeline>
		<TimelineItem date='Apr 2022 - now' icon='i-mdi:academic-cap' title='Ph.D. candidate, University of Tokyo, Japan'>
			{#snippet mainSlot()}Applied Computer Science{/snippet}
		</TimelineItem>
		<TimelineItem date='Apr 2019 - Mar 2022' icon='i-mdi:academic-cap' title='M.A.S.  University of Tokyo, Japan'>
			{#snippet mainSlot()}Applied Computer Science{/snippet}
		</TimelineItem>
		<TimelineItem
			date='Apr 2015 - Mar 2019'
			icon='i-mdi:academic-cap'
			title='B.A. International Christian University, Japan'>
			{#snippet mainSlot()}
				<p>College of Liberal Arts</p>
				<p>Information Science Major, Economics Minor</p>
			{/snippet}
		</TimelineItem>
		<TimelineItem date='Apr 2018 - Mar 2019' icon='i-mdi:academic-cap' title='The University of Edinburgh, UK'>
			{#snippet mainSlot()}
				<p>School of Informatics</p>
				<p>Exchange Program</p>
			{/snippet}
		</TimelineItem>
		<TimelineItem date='Apr 2009 - May 2015' icon='i-mdi:academic-cap' title='Shiba Junior & Senior High School, Japan' />
	</Timeline>
</article>
