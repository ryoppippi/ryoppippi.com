<script>
	/** @type {string} */
	export let icon;

	/** @type {string} */
	export let title = '';

	/** @type {string} */
	export let date;

	/** @type {boolean} */
	export let hidden = false;

	import Icon from '@iconify/svelte';
</script>

<li class="mb-10 ml-6 transition-opacity" class:opacity-20={hidden}>
	<span
		class="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-me-primary-200 ring-8 ring-gray-900">
		<Icon {icon} />
	</span>

	<h3 class="mb-1 flex items-center text-lg font-semibold text-me-text-100">
		{title}
		<slot name="title" />
	</h3>

	<time class="mb-2 block text-sm font-normal leading-none text-me-text-200">
		{date}
	</time>

	<p class="mb-4 text-base font-normal text-gray-500">
		<slot name="main" />
	</p>

	<slot name="other" />
</li>
