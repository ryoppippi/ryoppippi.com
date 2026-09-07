# Ox Content integration boundary

The site uses the public Ox Content 3.0.0 release. This directory now contains
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

## Active release gates

All issues are in <https://github.com/ubugeeei-prod/ox-content>.

- [#1347](https://github.com/ubugeeei-prod/ox-content/issues/1347): #1328's SSR
  stylesheet discovery was trialled in 3.0.0. Its raw CSS concatenation leaves
  local/package `@import` unresolved and bypasses Vite CSS minification.
  Retain `ssr-styles-plugin.ts`, its generic integration test and
  `virtual:site/ssr-styles` until the released implementation runs the Vite CSS
  pipeline. The filename registry remains deleted; discovery is automatic.
- [#1351](https://github.com/ubugeeei-prod/ox-content/issues/1351): the root
  declaration barrel still imports minified aliases removed by custom-host export
  stabilisation. Replace `SiteContentAssetManifest` with the repaired public
  `CollectionAssetManifest` export after release. The temporary alias derives
  from the native context return type; no copied structural interface is used.

Keep the PR Draft. For each installable compatible release, adopt the fix, delete
its fallback and redundant tests, verify dev/SSG/browser behaviour, push and audit
the remaining site/framework boundary again. Closed issues are not completion.
