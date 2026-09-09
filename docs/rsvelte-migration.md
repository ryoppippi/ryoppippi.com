# Svelte migration with rsvelte

All production pages, layouts and authored GTV islands now use Svelte compiled by
`@rsvelte/vite-plugin-svelte` 0.5.2. The lockfile resolves its native compiler to
0.3.12 and the Svelte runtime to 5.57.0. The replaced Solid components, CSS Modules,
Solid integrations and direct dependencies have been removed.

## Rendering and styling

The custom HTML host renders page and layout components with `svelte/server`.
The rsvelte plugin uses `emitCss: false` and `compilerOptions.css: 'injected'`;
the host carries `render().head` into the document so compiler-generated scoped
styles work on the first response, including without JavaScript. It does not scan
Svelte files or reconstruct scope hashes. Global styles, generated Markdown styles
and the chart's shared CSS remain ordinary CSS.

Ox Content still parses Markdown/MDX, resolves authored imports, serialises island
payloads and controls island initialisation. A small site adapter renders imported
Svelte components through Vite's server module loader and preserves their head
output. The browser uses an explicit lazy import for the published GTV component
in `src/client/islands.ts`. New interactive components must be registered there;
unpublished content is not added through a broad glob. This is a temporary,
site-specific integration pending public upstream Svelte HTML-host APIs.
The current GTV island uses eager loading. The synchronous upstream hydration
callback requires preparing its modules first; deferred chunk loading and islands
in the showcase collection are not supported by this site adapter.

Vite+ runs Oxfmt for all supported sources, including Svelte through
`fmt.svelte: true`. `pnpm format` runs `vp check --fix`; `pnpm check` also runs
`svelte-check`. There is no separate Prettier configuration, command or direct
dependency. Shared generated-Markdown CSS remains intentionally unscoped.

## Upstream follow-up

Reproduced against ox-content 3.1.2 on 2026-09-09:

| Issue                                                            | Gap                                                            | Current site integration                                                                       |
| ---------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [#1375](https://github.com/ubugeeei-prod/ox-content/issues/1375) | Generated Svelte Markdown/MDX calls `svelte/compiler` directly | Use the core HTML Markdown renderer and compile authored `.svelte` components through rsvelte. |
| [#1376](https://github.com/ubugeeei-prod/ox-content/issues/1376) | Scoped CSS discovery for static Svelte SSR roots               | Deliver the native compiler's injected styles from `render().head`.                            |
| [#1377](https://github.com/ubugeeei-prod/ox-content/issues/1377) | Public Svelte custom HTML-host and island registry integration | Use the small site-owned HTML adapter and explicit published-component map.                    |

These issues remain upstream follow-ups, not prerequisites for switching this
site. Monitor their comments, linked PRs and releases, then adopt suitable public
APIs and remove the corresponding adapters. Do not implement changes in the
ox-content repository as part of this website PR. Keep the PR Draft until the
user asks otherwise.

## Verification checkpoint

- Production build generates 428 output files using the Svelte route graph.
- All 39 tests pass, including Japanese/English chart SSR, escaped component
  properties, authored island rendering and publication-aware content assets.
- Oxfmt, lint, TypeScript and `svelte-check` pass.
- Actual development pages render scoped styles; theme switching and blog language
  filtering work. The GTV article hydrates one chart with one SVG and eighteen
  evidence rows. Keyboard focus updates its row highlight and live readout.
- Production browser checks cover 390px-wide pages without horizontal overflow,
  homepage and About styling without JavaScript, and chart hydration/keyboard
  interaction without console warnings or errors.

The captured Solid baseline emitted 18 JavaScript files totalling 312,183 bytes
(109,042 bytes when each file is gzip-compressed). The Svelte build emits three
JavaScript files totalling 208,310 bytes (73,944 gzip bytes). These are sums of
emitted artefacts, not per-page transfer measurements or a general comparison of
the two frameworks. Pages without islands do not load the Svelte runtime.
