<script>
	import { page } from '$app/stores';
</script>

<div class='grid place-content-center place-items-center pt-10'>
	{$page.url}
	{$page.status}
	<hr class='mb-4 divide-solid !border-t-8' />
	<a class='variant-filled-primary btn' href='/'>Return to Home</a>
</div>
