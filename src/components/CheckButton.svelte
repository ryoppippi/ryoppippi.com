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
	class='fyc gap-1 opacity-30 text-sm'
	aria-pressed={checked}
	type='button'
>
	<!-- svelte-ignore element_invalid_self_closing_tag -->
	<div
		class={{
			'icon-[carbon--checkbox]': !checked,
			'icon-[carbon--checkbox-checked]': checked,
		}}
		aria-hidden='true'
	/>
	{text}
</button>
