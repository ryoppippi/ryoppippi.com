<script lang='ts'>
	import { ModeWatcher } from 'mode-watcher';
	import type { ComponentProps } from 'svelte';
	import { CheckTransitions } from './runes.svelte';

	const ct = new CheckTransitions();

	const { ...modeWatcherProps }: ComponentProps<ModeWatcher> = $props();
</script>

<!-- disable transition when reducing motion & transition api is available -->
<ModeWatcher disableTransitions={ct.isAppearanceTransition} {...modeWatcherProps} />

<style>
:global{
  body {
    --at-apply: motion-safe:(transition transition-duration-1s)
  }
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none;
    mix-blend-mode: normal;
  }
  ::view-transition-old(root) {
    z-index: 1;
  }
  ::view-transition-new(root) {
    z-index: 9999;
  }
  .dark::view-transition-old(root) {
    z-index: 9999;
  }
  .dark::view-transition-new(root) {
    z-index: 1;
  }
}
</style>
