<script lang='ts'>
	type Props = {
		title: string;
		level?: 1 | 2;
		viewTransitionName?: string;
		selectDisabled?: boolean;
		opacity?: boolean;
	};
	const {
		title,
		level = 1,
		viewTransitionName,
		selectDisabled = false,
		opacity = true,
	}: Props = $props();

	const tag = $derived(`h${level}` as const);
</script>

<svelte:element
	this={tag}
	style:view-transition-name={viewTransitionName}
	class={[
		'f-text-32-64 my-8 font-mono font-bold leading-none text-stroke-aaa text-transparent',
		{ 'opacity-35 dark:opacity-20': opacity, 'select-none': selectDisabled },
	]}
>
	{title}
</svelte:element>
