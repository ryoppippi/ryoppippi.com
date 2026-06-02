<script lang='ts'>
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Checkbox from '~icons/carbon/checkbox';
	import CheckboxChecked from '~icons/carbon/checkbox-checked';

	type Props = {
		text: string;
		checked?: boolean;
	} & HTMLButtonAttributes;

	const {
		text,
		checked = $bindable(false),
		class: className,
		...rest
	}: Props = $props();
</script>

<button
	{...rest}
	class={[className, 'fyc gap-1 opacity-30 text-sm']}
	aria-pressed={checked}
	type='button'
>
	{#if checked}
		<CheckboxChecked aria-hidden='true' />
	{:else}
		<Checkbox aria-hidden='true' />
	{/if}
	{text}
</button>
