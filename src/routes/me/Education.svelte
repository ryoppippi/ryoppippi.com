<script>
	import Timeline from '$lib/Timeline.svelte';
	import TimelineItem from '$lib/TimelineItem.svelte';

	import IconAcademicCap from '~icons/mdi/academic-cap';
</script>

<article>
	<h1 class="my-5 text-3xl" id="education">Education</h1>
	<Timeline>
		<TimelineItem icon={IconAcademicCap} title="Ph.D. candidate, University of Tokyo, Japan" date="Apr 2022 - now">
			<span slot="main">Applied Computer Science</span>
		</TimelineItem>
		<TimelineItem icon={IconAcademicCap} title="M.A.S.  University of Tokyo, Japan" date="Apr 2019 - Mar 2022">
			<span slot="main">Applied Computer Science</span>
		</TimelineItem>
		<TimelineItem
			icon={IconAcademicCap}
			title="B.A. International Christian University, Japan"
			date="Apr 2015 - Mar 2019">
			<span slot="main">
				<p>College of Liberal Arts</p>
				<p>Information Science Major, Economics Minor</p>
			</span>
		</TimelineItem>
		<TimelineItem icon={IconAcademicCap} title="The University of Edinburgh, UK" date="Apr 2018 - Mar 2019">
			<span slot="main">
				<p>School of Informatics</p>
				<p>Exchange Program</p>
			</span>
		</TimelineItem>
		<TimelineItem icon={IconAcademicCap} title="Shiba Junior & Senior High School, Japan" date="Apr 2009 - May 2015" />
	</Timeline>
</article>
