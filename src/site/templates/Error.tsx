/**
 * Renders the not-found page body.
 *
 * @returns The not-found page fragment.
 */
export default function ErrorPage() {
	return (
		<div class="fcol fxc min-h-[50vh] text-center">
			<h1 class="text-6xl font-bold">404</h1>
			<p class="mt-4 opacity-60">Page not found</p>
			<a class="mt-8 underline" href="/">
				Back home
			</a>
		</div>
	);
}
