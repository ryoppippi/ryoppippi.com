<script>
	/** @type {string} */
	export let icon;

	/** @type {string} */
	export let title;

	/** @type {number} */
	export let value;

	import Icon from '@iconify/svelte';
	import { ProgressBar } from '@skeletonlabs/skeleton';
</script>

<div>
	<span class="flex h-10 w-10 items-center justify-center rounded-full bg-me-primary-200 ring-8 ring-gray-900">
		<Icon {icon} style="font-size: {2.6}vh" />
	</span>
	<span class="flex-auto">
		<dt class="mb-1">{title}</dt>
		<dd class="flex">
			<ProgressBar class="max-w-[90%]" label="Progress Bar" {value} max={100} />
			<span>{value}%</span>
		</dd>
	</span>
</div>
