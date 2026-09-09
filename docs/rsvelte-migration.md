# Svelte migration with rsvelte

This Draft migration replaces Solid components and CSS Modules with Svelte components
and scoped `<style>` blocks. The component implementations are prepared; production
routes still use Solid until ox-content exposes the integration required by this
custom HTML host. Adding the rsvelte Vite plugin alone does not complete that switch.

## Current implementation

- `@rsvelte/vite-plugin-svelte` 0.5.2 compiles `.svelte` components and rune modules.
  The lockfile resolves its native compiler to 0.3.12 and Svelte to 5.57.0.
- Nineteen Svelte page/layout components sit beside the existing Solid components.
  Component CSS lives in scoped `<style>` blocks; shared article content CSS stays
  in `ArticleContent.css` because it styles generated Markdown HTML.
- The GTV chart has four Svelte components and a rune-based scroll-reveal helper.
  It keeps the shared chart definition, bilingual copy, evidence links, accessible
  table, and chart adapter. Its shared CSS is ordinary CSS, not a CSS Module.
- `pnpm check` includes `svelte-check` and Svelte formatting. Vite+ continues to
  format other sources; Prettier handles `.svelte` files, which Vite+ does not format.
- `src/rsvelte.test.ts` exercises Svelte SSR through the configured rsvelte plugin.

## Upstream dependencies

Reproduced against ox-content 3.1.2 on 2026-09-09:

| Issue                                                            | Required behaviour                                                       | Observed limitation                                                                                                                                      |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#1375](https://github.com/ubugeeei-prod/ox-content/issues/1375) | Select rsvelte for generated Svelte Markdown/MDX                         | The Svelte renderer imports `compile` directly from `svelte/compiler`. A Vite plugin cannot intercept that call.                                         |
| [#1376](https://github.com/ubugeeei-prod/ox-content/issues/1376) | Discover scoped CSS from static Svelte SSR roots and transitive imports  | A minimal custom host rendered `Error.svelte` with a scope class but returned no stylesheets; production also reported the `.svelte` root as unresolved. |
| [#1377](https://github.com/ubugeeei-prod/ox-content/issues/1377) | Public Svelte HTML-host renderer, island registry and client integration | The public helpers this site currently uses are Solid-specific.                                                                                          |

Use released public upstream APIs when these gaps are addressed. Do not duplicate
the framework renderer, scoped-CSS discovery or island registry inside this site.
The existing adoption boundary is documented in [ox-content.md](./ox-content.md).

## Remaining switch

1. Upgrade the ox-content catalog together and select rsvelte for its Svelte
   Markdown/MDX renderer. Confirm the generated server and client paths both use it.
2. Change page imports and `pageModule`/source dependencies from `.tsx` to `.svelte`.
   Use `svelte/server` rendering in the page/layout helpers. Update document assets,
   homepage styles and `ssrStylesheets` roots, verifying compiler scope hashes match.
3. Adopt the Svelte HTML-host renderer and island registry in the Markdown,
   collection-assets, blog document and browser bootstrap code. Preserve draft
   publication rules and the existing navigation/disposal lifecycle.
4. Point both GTV article MDX imports at `GtvChart.svelte`. Verify initial SSR,
   hydration, keyboard/pointer focus, navigation away/back, and reduced motion.
5. Remove the replaced `.tsx` components, CSS Modules, Solid helpers, dependencies
   and JSX settings. Update the content skill and integration documentation to match.
6. Verify cold development and production on desktop/mobile, including no-JS CSS,
   dark mode, filters, feeds, article assets and 404. Measure emitted HTML/CSS/JS
   against the Solid baseline before making bundle-size claims.

## Verification checkpoint

The unchanged Solid route graph builds 428 output files after the dependency and
plugin changes. A separate local Vite fixture successfully rendered and hydrated
the Svelte chart with rsvelte: one figure, one SVG, eighteen evidence rows, no
browser warnings/errors, and keyboard focus updated the live readout and focused
row. Japanese and English chart SSR are covered by the new regression tests.

That fixture verifies the Svelte components, not ox-content island integration.
Scoped CSS delivery through the custom host and full-site Svelte navigation remain
unverified until the upstream dependencies above are adopted. Keep this PR Draft.
