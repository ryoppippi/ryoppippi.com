# Ox Content integration boundary

The site uses the public Ox Content 3.1.1 release. Native custom-host stylesheet
discovery replaces the last local Vite plugin; no implementation or ambient
declaration remains under `src/ox-content`.

## Ownership

- `content/`: authored Markdown/MDX, JSON, media and post-local components.
- `pages/`: URL-shaped endpoints and their colocated UI, data and publication policy.
- `utils/ssg/`: shared build/dev host composition, route collection and output preparation.
- `components/SiteLayout/`: document structure, head values and asset selection.
- `config/`: shared content root, collection selection and Markdown options.
- `utils/ssg/markdown.ts`: page-level composition of native Markdown rendering and
  the native Solid renderer, returning the article's client modules and selecting
  their styles. It does not parse Markdown, run embed transforms, discover MDX
  imports or implement the Solid renderer lifecycle.
- `utils/ssg/home-styles.ts`: homepage-only inlining using native artifact contents.
- `utils/ssg/content-assets.ts`: selected document references and explicit showcase
  covers/legacy aliases, not an extension allowlist or recursive asset scanner.

All collections are rooted at `src/content`; blog and showcase source patterns
stay inside that common root. Production requires explicit `isPublished: true`
for blog assets and client islands; development permits draft previews.

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
- Page assets request `/src/pages/<style>/page.tsx` from `assets.ssrStylesheets()`
  on demand. Vite config declares one root-relative `src/pages/**/page.tsx` glob
  and the shared layout root; there is no second scanner or CSS filename registry.
- Homepage inlining uses the same native SSR results and `stylesheetContent()`;
  browser island assets continue to use the browser stylesheet resolver.
- Verification: 37 tests in 12 files, formatting/lint/types, typos and 428 SSG
  outputs pass. All 1,517 local asset references across 81 HTML files exist.
  All five Works pages include their transitive CSS in order; 2,393 rendered
  hashed-class checks find matching linked/inline selectors. No raw `:global`
  remains and no SSR stylesheet-entry JavaScript is linked by the documents.
  Fresh development HTML, Markdown and RSS responses and browser layout pass.

## Remaining boundary

All previously filed adoption gates are released and adopted. Site-owned
publication/legacy URL policy, data loading, layout/head values, page enumeration
and homepage critical-CSS selection remain local. They compose supported host
APIs rather than implementing a dev server, Markdown renderer or asset pipeline.

Keep the PR Draft and unmerged while checking the pushed CI/review state and
remaining integration boundary. File a new issue only for a reproduced public
contract gap, then continue the release/adopt/delete/verify cycle.
