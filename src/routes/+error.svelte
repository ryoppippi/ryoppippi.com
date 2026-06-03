<script>
	import { page } from '$app/state';
</script>

<div class='fcol gcc pt-10'
>
	{page.url}
	{page.status}
	<div class='p-2'> <hr class='m-auto w-50 opacity-25' /> </div>
	<a href='/'>Return to Home</a>
</div>
