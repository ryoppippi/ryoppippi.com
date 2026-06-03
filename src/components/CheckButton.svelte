<script lang='ts'>
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Icon from '$components/Icon.svelte';

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
		<Icon class='icon-[carbon--checkbox-checked]' aria-hidden='true' />
	{:else}
		<Icon class='icon-[carbon--checkbox]' aria-hidden='true' />
	{/if}
	{text}
</button>
