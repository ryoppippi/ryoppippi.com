<script>
	import { CodeBlock } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
</script>

<div class="grid place-content-center place-items-center pt-10">
	<CodeBlock
		buttonLabel=""
		language="sh"
		code={`
> curl -s -o /dev/null -w "%{http_code}" ${$page.url}
${$page.status}
    `} />
	<hr class="mb-4 divide-solid !border-t-8" />
	<a href="/" class="variant-filled-primary btn">Return to Home</a>
</div>
