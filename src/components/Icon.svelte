<script lang='ts'>
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = HTMLAttributes<HTMLSpanElement>;

	const { class: className, ...rest }: Props = $props();
</script>

<!-- svelte-ignore element_invalid_self_closing_tag -->
<span {...rest} class={className} />
