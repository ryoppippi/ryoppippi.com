# Svelte migration with rsvelte

Production pages, layouts and the GTV islands use Svelte 5.57.0 compiled by
`@rsvelte/vite-plugin-svelte` 0.5.2 and its native compiler 0.3.12. Solid components,
CSS Modules and direct dependencies are removed. Oxfmt handles Svelte through
`fmt.svelte: true`; no separate Prettier tooling is configured.

## Public Ox Content integration

Ox Content 3.1.3 includes [#1383](https://github.com/ubugeeei-prod/ox-content/pull/1383),
resolving the initial compiler, CSS and HTML-host requests #1375–#1377. The site
now uses its public Svelte renderer, publication-aware collection helper, automatic
island registry and lazy hydration adapter. The local `svelte-islands.ts`,
`collection-documents.ts` and `client/islands.ts` implementations are deleted.

The adapter is included in the Vite SSR module graph with `ssr.noExternal` so
its renderer and compiled components share runtime state. Without this setting,
a fresh dev article request fails; tracked in
[#1393](https://github.com/ubugeeei-prod/ox-content/issues/1393).

The site owns its publication policy, document composition and asset selection.
Ox Content owns document import resolution, island SSR insertion, module discovery,
virtual browser loaders, loading/error handling and Svelte hydration/disposal.
New published article imports no longer require a manual browser module map.
The website still uses the core HTML Markdown renderer; authored `.svelte` files
are compiled by the configured rsvelte plugin. Generated Svelte Markdown modules
are not part of this site's rendering path.

## Scoped CSS follow-up

The native compiler's injected CSS and page/layout `render().head` delivery remain
in use. Testing external scoped CSS through 3.1.3 exposed
[#1389](https://github.com/ubugeeei-prod/ox-content/issues/1389): SSR-only Svelte
root imports can be tree-shaken, losing the component stylesheet while the build
succeeds. No local stylesheet scanner or scope-hash reconstruction is added.

The current GTV island uses an ordinary imported stylesheet. The upstream HTML-host
renderer returns body HTML without head metadata, so arbitrary islands with scoped
injected CSS or `<svelte:head>` need an upstream solution before adoption. Page and
layout scoped styles work before JavaScript. Shared article styles remain external
because they style generated Markdown HTML.

[#1384](https://github.com/ubugeeei-prod/ox-content/issues/1384) tracks a common
HTML-host island contract across framework adapters. Monitor these follow-ups,
adopt suitable released APIs and remove corresponding temporary configuration.
Keep the website PR Draft; do not implement upstream changes under this task.

## Verification and performance

The three required configurations are Solid v2, Svelte with its official compiler,
and Svelte with rsvelte. Each was measured with three cold/warm full SSG build
pairs; all generated 428 outputs and 81 HTML files. Browser checks confirmed one
interactive GTV chart, one SVG and eighteen evidence rows in every configuration.
The same keyboard interaction updates the focused row and live readout. The fresh
rsvelte development server also passes SSR, hydration and keyboard checks after
the runtime configuration above.

See the [benchmark report](./benchmarks/frameworks-2026-09-09.md) and its raw JSON
for exact versions, timing ranges, JS/CSS/HTML sizes, page payload estimates and
limitations. Official Svelte and rsvelte produce almost identical bundle sizes;
the measured timing differences are specific to this site and sampling conditions.

Oxfmt, lint, TypeScript, Svelte diagnostics and all 39 tests pass. One test run hit
a five-second timeout; an unchanged rerun passed. The draft's CI and preview status
must be checked for the latest pushed commit separately.
