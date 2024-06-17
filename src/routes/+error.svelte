<script>
	import { CodeBlock } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
</script>

<div class='grid place-content-center place-items-center pt-10'>
	<CodeBlock
		buttonLabel=""
		code={`
> curl -s -o /dev/null -w "%{http_code}" ${$page.url}
${$page.status}
    `}
		language='sh' />
	<hr class='mb-4 divide-solid !border-t-8' />
	<a class='variant-filled-primary btn' href='/'>Return to Home</a>
</div>
