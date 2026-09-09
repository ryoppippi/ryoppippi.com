# Ox Content integration boundary

The site uses public Ox Content 3.1.2 with Svelte components compiled by rsvelte.
Svelte SSR supplies scoped CSS through `render().head`; the custom host still
owns global CSS, article CSS and island asset URLs. See [rsvelte-migration.md](./rsvelte-migration.md)
for the current integration and upstream follow-ups. The adoption history below
describes the earlier Solid implementation where explicitly named.

## Ownership

- `content/`: authored Markdown/MDX, JSON, media and post-local components.
- `pages/`: URL-shaped endpoints and their colocated UI, data and publication policy.
- `utils/ssg/`: shared build/dev host composition, route collection and output preparation.
- `components/SiteLayout/`: document structure, head values and asset selection.
- `config/`: shared content root, collection selection and Markdown options.
- `utils/ssg/markdown.ts`: page-level composition of native Markdown rendering and
  Svelte SSR, returning the article's client modules, head and styles.
- `utils/ssg/svelte-islands.ts`: connects public import resolution and island SSR
  hooks to Svelte rendering; Ox Content still parses Markdown and island payloads.
- `client/islands.ts`: an explicit lazy map of published Svelte islands, hydrated
  through Svelte with Ox Content's framework-neutral load strategies.
- `utils/ssg/home-styles.ts`: homepage-only inlining using native artifact contents.
- `utils/ssg/content-assets.ts`: selected document references and explicit showcase
  covers/legacy aliases, not an extension allowlist or recursive asset scanner.

All collections are rooted at `src/content`; blog and showcase source patterns
stay inside that common root. Production requires explicit `isPublished: true`
for blog assets; development permits draft previews. Only explicitly registered
public components enter the client bundle.

## Adopted in 3.0.0

| Issue | Adoption                                                                                     |
| ----- | -------------------------------------------------------------------------------------------- |
| #1315 | Native custom-host context types; root barrel regression tracked below.                      |
| #1316 | `planCollectionAssetsFromDocuments`; removed extension allowlist and asset globs.            |
| #1317 | `createSolidHtmlHostRenderer`; deleted `island-renderer.ts`.                                 |
| #1318 | `assets.collectionManifest()`; removed the prerender planning pass.                          |
| #1319 | `dev.feedOutputs` and `outputs()`; deleted generic/feed-route adapters.                      |
| #1320 | `context.markdown.render()`; deleted Markdown pipeline and dev plugin.                       |
| #1321 | Published collection virtual types; removed the downstream collection declaration.           |
| #1322 | Configured collection documents and site selection; removed glob/read/frontmatter discovery. |
| #1323 | `assets.stylesheetContent()`; removed CSS URL-to-filesystem reconstruction.                  |

## Adopted in 3.1.0

- [#1351](https://github.com/ubugeeei-prod/ox-content/issues/1351): the repaired
  root declaration barrel supplies `CollectionAssetManifest` directly. Deleted
  the temporary `SiteContentAssetManifest` alias.
- [#1347](https://github.com/ubugeeei-prod/ox-content/issues/1347): ordinary CSS
  imports run through Vite. The initial adoption exposed CSS Modules regressions,
  subsequently resolved by the 3.1.1 fixes below.

## Historical verification in 3.1.1-beta.0

The official npm beta includes the fixes from
[#1366](https://github.com/ubugeeei-prod/ox-content/pull/1366).

- [#1359](https://github.com/ubugeeei-prod/ox-content/issues/1359): native SSR
  CSS Module class names now match the HTML and `:global(...)` is transformed.
  That beta exposed the separate shared-artifact gap resolved in 3.1.1 below.
- [#1360](https://github.com/ubugeeei-prod/ox-content/issues/1360): shared dev CSS
  remains in each root descriptor for A+B, B+A and B alone, while the aggregate
  list deduplicates. Verified through the public custom-host asset context.
- [#1361](https://github.com/ubugeeei-prod/ox-content/issues/1361): adding a page
  to the running eager-glob route catalogue makes it available; deleting it
  returns 404 without a restart. No downstream HMR/cache workaround is needed.

## Adopted in 3.1.1

- [#1367](https://github.com/ubugeeei-prod/ox-content/issues/1367), fixed by
  [#1368](https://github.com/ubugeeei-prod/ox-content/pull/1368): native build
  results include the ordered CSS dependency graph, including shared imported
  chunks. Deleted the 180-line SSR stylesheet plugin, its virtual declaration and
  its generic integration test. Stylesheet discovery, CSS Modules, artifact
  traversal and shared-style deduplication now belong to Ox Content.
- Page assets request each page component module (for example,
  `/src/pages/about/About.tsx`) from `assets.ssrStylesheets()` on demand. Vite
  config declares one root-relative `src/pages/**/*.tsx` glob and the shared
  layout root; there is no second scanner or CSS filename registry.
- Homepage inlining uses the same native SSR results and `stylesheetContent()`;
  browser island assets continue to use the browser stylesheet resolver.
- Verification: 37 tests in 12 files, formatting/lint/types, typos and 428 SSG
  outputs pass. All 1,517 local asset references across 81 HTML files exist.
  All five Works pages include their transitive CSS in order; 2,393 rendered
  hashed-class checks find matching linked/inline selectors. No raw `:global`
  remains and no SSR stylesheet-entry JavaScript is linked by the documents.
  Fresh development HTML, Markdown and RSS responses and browser layout pass.

## Shared SSG audit (2026-09-08)

All eight modules under `src/utils/ssg` were checked against the installed public
APIs, including their callers in pages and Vite configuration.

| Module              | Removed or delegated                                                                                                     | Remaining site responsibility                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `build.ts`          | Reuses the memoised Markdown renderer instead of creating another.                                                       | Composes published posts, showcase and feed data.                                       |
| `dev.ts`            | Shares blog metadata through native `context.memo`; no local 404 handler.                                                | Supplies page assets and source data to the native host.                                |
| `context.ts`        | Removes four single-page loader adapters; accepts native `MaybePromise`.                                                 | Shares loaders whose preloaded build data differs from development.                     |
| `route.ts`          | Allows synchronous renderers with native `MaybePromise`.                                                                 | Discovers page modules and combines static/content-derived URLs.                        |
| `prerender.ts`      | Leaves route execution to the native host instead of eagerly rendering and wrapping results; creates one shared context. | Selects published posts and rewrites article asset URLs before head/JSON-LD generation. |
| `content-assets.ts` | Uses the planner's content-root boundary for showcase covers.                                                            | Chooses publishable documents, cover references and legacy URL aliases.                 |
| `markdown.ts`       | Removes redundant conditional checks.                                                                                    | Connects the public Markdown and Solid renderers and selects article island styles.     |
| `home-styles.ts`    | Already reads native stylesheet artefacts; no scanner remains.                                                           | Chooses the homepage's critical inline CSS.                                             |

Single-page loaders now live at their page call sites, and duplicated Markdown
options were removed from the build configuration. Two configuration bugs were
reproduced and fixed without introducing a plugin or custom validation:

- The native dev dependency watcher now covers all of `src/content`, not just
  blog posts. A media JSON edit and its restoration update both the media page
  and RSS output without restarting the server.
- Explicit showcase covers could previously publish a file outside `src/content`
  but inside the repository. Setting the planner's `root` to the content directory
  rejects that reference; a real filesystem regression test verifies the boundary.

Verification: 38 tests in 12 files pass, with 428 custom-host outputs. All 601
generated files are byte-for-byte identical to the pre-audit build. Remaining
adapters are site composition, not reproduced framework machinery; this audit
did not uncover a new upstream public-contract gap requiring an issue.

## Adopted in 3.1.2

- [#1370](https://github.com/ubugeeei-prod/ox-content/issues/1370), fixed by
  [#1373](https://github.com/ubugeeei-prod/ox-content/pull/1373): island discovery
  disables embeds internally. Removed the registry-only `embeds: false` override;
  actual page rendering retains the shared embed settings.
- [#1371](https://github.com/ubugeeei-prod/ox-content/issues/1371), fixed by
  [#1372](https://github.com/ubugeeei-prod/ox-content/pull/1372): custom-host output
  shares a per-build cache for identical inline JS/CSS minification. HTML
  compression remains enabled, including hydration-comment preservation.

Verification on 2026-09-09: check and all 38 tests in 12 files passed. All generated
files were byte-identical to the pre-update 3.1.1 build, with 428 custom-host
outputs. Browser verification covered production GtvChart rendering and arrow-key
selection, article link previews, and Tweet text/images on a fresh dev server.
A source audit found no reproduced regression in the changed discovery/cache
paths; CSS cache keys distinguish context and JS keys distinguish inline scripts.

| Measurement                                   | 3.1.2       |
| --------------------------------------------- | ----------- |
| First build after dependency update, CLI wall | 3.97 s      |
| Subsequent warm build, CLI wall               | 3.91 s      |
| Empty Vite cache, CLI wall                    | 4.08 s      |
| Vite-reported client build                    | 0.64-0.67 s |
| Profiled HTML minification and writes         | 0.24 s      |
| Profiled coordinated output writer            | 0.57 s      |

The Vite-cache-cold run retained the existing Ox Content embed cache; it is not
a fully network-cold build. The previous 3.1.1 diagnostic samples measured
minification/writes at 0.57 s, output writer at 0.97 s and CLI wall at 4.90 s.
The immediate pre-update CLI sample was 7.58 s, illustrating run-to-run variance.
These are diagnostic samples, not controlled benchmark guarantees.

Continue monitoring and repeating release/adopt/remove/verify/re-audit within
build performance and the related island/embed scope. Both initial issues are
released and adopted; this checkpoint does not stop the monitor or authorise
marking the Draft PR ready or merging it.

## Remaining boundary

All previously filed adoption gates are released and adopted. Site-owned
publication/legacy URL policy, data loading, layout/head values, page enumeration
and homepage critical-CSS selection remain local. They compose supported host
APIs rather than implementing a dev server, Markdown renderer or asset pipeline.

Production 404 routing belongs to Wrangler's `assets.not_found_handling` setting.
Development uses Vite's `appType: 'mpa'` and standard 404 response, without a custom
`notFound` callback. The generated error document can be inspected at `/404.html`.

Keep the PR unmerged while checking the pushed CI/review state and
remaining integration boundary. File a new issue only for a reproduced public
contract gap, then continue the release/adopt/delete/verify cycle.
