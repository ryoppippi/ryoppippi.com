<script lang='ts'>
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Props = {
		text: string;
		checked?: boolean;
	} & HTMLButtonAttributes;

	const {
		text,
		checked = $bindable(false),
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
	<div
		class={{
			'i-carbon-checkbox': !checked,
			'i-carbon-checkbox-checked': checked,
		}}
	/>
	{text}
</button>
