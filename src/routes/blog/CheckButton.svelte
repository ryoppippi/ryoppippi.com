<script lang='ts'>
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Props = {
		text: string;
		iconClass: string;
	} & HTMLButtonAttributes;

	const {
		text,
		iconClass = $bindable(''),
		...rest
	}: Props = $props();
</script>

<button
	{...rest}
	fyc='~'
	gap-1='~'
	op30='~'
	text-sm='~'
	type='button'
>
	<!-- svelte-ignore element_invalid_self_closing_tag -->
	<div class={iconClass} />
	{text}
</button>
