<script>
	import { page } from '$app/stores';
</script>

<div
	fcol
	grid
	place='content-center items-center'
	pt-10
	text-text-100
>
	{$page.url}
	{$page.status}
	<div p2> <hr ma op25 w-50 /> </div>
	<a href='/'>Return to Home</a>
</div>
