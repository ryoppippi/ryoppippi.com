# Ox Content integration boundary

The site uses the public Ox Content 3.1.1-beta.0 prerelease. This directory contains
only the temporary SSR CSS discovery plugin and its local virtual declaration.

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
  imports now run through Vite, but the released adoption exposed the CSS Modules
  regression below. The local CSS plugin cannot yet be deleted.

## Verified in 3.1.1-beta.0

The official npm beta includes the fixes from
[#1366](https://github.com/ubugeeei-prod/ox-content/pull/1366).

- [#1359](https://github.com/ubugeeei-prod/ox-content/issues/1359): native SSR
  CSS Module class names now match the HTML and `:global(...)` is transformed.
  Production migration still exposes the separate shared-artifact gap below.
- [#1360](https://github.com/ubugeeei-prod/ox-content/issues/1360): shared dev CSS
  remains in each root descriptor for A+B, B+A and B alone, while the aggregate
  list deduplicates. Verified through the public custom-host asset context.
- [#1361](https://github.com/ubugeeei-prod/ox-content/issues/1361): adding a page
  to the running eager-glob route catalogue makes it available; deleting it
  returns 404 without a restart. No downstream HMR/cache workaround is needed.

## Active release gate

- [#1367](https://github.com/ubugeeei-prod/ox-content/issues/1367): native build
  results return only the root entry's first CSS artifact, omitting styles on
  shared imported chunks. Works pages lose WorksNav/WorksSection styling despite
  a successful build and correctly hashed selectors. Retain the existing
  `ssr-styles-plugin.ts`, virtual declaration and generic integration test until
  a public fix returns the complete ordered CSS graph. Verify shared/nested CSS
  is linked or inlined, not merely that returned hrefs exist. Do not add a second
  manifest walker or manual CSS registry downstream.

The attempted native adapter used the existing page style identity to request
`/src/pages/<style>/page.tsx` on demand, with a root-relative
`src/pages/**/page.tsx` build glob; no new page scanner is required when retrying.

Keep the PR Draft. For each installable compatible release, adopt the fix, delete
its fallback and redundant tests, verify dev/SSG/browser behaviour, push and audit
the remaining site/framework boundary again. Closed issues are not completion.
