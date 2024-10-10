<svelte:head>
	<script>
		if ( localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
		document.documentElement.classList.add('dark')
		} else {
		document.documentElement.classList.remove('dark')
		}
	</script>
	<meta name='theme-color' content='#ffffff' media='(prefers-color-scheme: light)' />
	<meta name='theme-color' content='#121212' media='(prefers-color-scheme: dark)' />
</svelte:head>

<style>
:global{
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
