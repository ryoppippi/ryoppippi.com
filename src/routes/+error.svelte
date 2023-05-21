<script>
	import { CodeBlock } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
</script>

<div class="grid h-screen w-screen place-content-center place-items-center pt-10">
	<CodeBlock
		buttonLabel=""
		language="bash"
		code={`
> curl -s -o /dev/null -w "%{http_code}" ${$page.url}
${$page.status} 
    `} />
	<hr class="mb-4 divide-solid !border-t-8" />
	<a href="/" class="btn variant-filled-primary">Return to Home</a>
</div>
