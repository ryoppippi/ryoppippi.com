# Ox Content integration boundary

The site uses the public Ox Content 3.1.0 release. This directory now contains
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

## Active release gates

All issues are in <https://github.com/ubugeeei-prod/ox-content>.

- [#1359](https://github.com/ubugeeei-prod/ox-content/issues/1359): 3.1.0's native
  SSR stylesheet bundles flatten `.module.css` as ordinary CSS. SSR class names
  are scoped, but built selectors are not and `:global(...)` remains unprocessed.
  Retain `ssr-styles-plugin.ts`, its generic integration test and
  `virtual:site/ssr-styles` until a released fix preserves CSS Module identity,
  local/package imports, URLs and minification. Check actual selector matches and
  browser appearance, not just build success. Discovery remains automatic.
- [#1360](https://github.com/ubugeeei-prod/ox-content/issues/1360): a multi-root
  development `assets.ssrStylesheets()` call omits shared CSS from later roots'
  descriptors. Each descriptor must contain its complete root styles; only the
  aggregate list should deduplicate across roots. Verify dev/build parity before
  adopting native per-page grouping.
- [#1361](https://github.com/ubugeeei-prod/ox-content/issues/1361): watched page
  additions/deletions leave the eager-glob dev route catalogue stale in 3.1.0,
  despite SSR reload logs. A new route remains 404; a deleted route keeps its old
  200 response. Restarting picks up the current files. Verify real dev add/remove
  behaviour after a public fix; do not introduce a downstream cache/HMR plugin.

Keep the PR Draft. For each installable compatible release, adopt the fix, delete
its fallback and redundant tests, verify dev/SSG/browser behaviour, push and audit
the remaining site/framework boundary again. Closed issues are not completion.
