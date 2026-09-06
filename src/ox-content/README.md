# Ox Content integration boundary

This directory contains adapters that can shrink when supported upstream APIs
are released. It is not a home for site data, layout, or page policy.

## Ownership

- `content/`: authored Markdown/MDX, JSON, media, and post-local components.
- `pages/`: discovered endpoint definitions, page UI, and page-specific data loaders.
- `components/SiteLayout/`: shared document structure, head values, and asset selection.
- `config/`: site configuration, source selection, and Markdown options.
- `pages/prerender.ts`: site-owned production route preparation.
- `pages/dev.ts`: development route/data composition and site-specific 404 policy.
- `ox-content/`: build-host connection, temporary framework adapters, and the virtual-module type shim.

Post-local components remain beside their articles. Island discovery and rendering
are framework integration, so they do not live in the authored-content directory.
Page endpoint URLs remain explicit; file discovery does not infer URL semantics.

`dev-plugin.ts` is a local proof of the plugin interface requested in #1320.
It supplies request-local Markdown/Solid rendering and island styles to the site
host while the native plugin still owns middleware, caching, loading and watchers.
The old `dev-server/` directory is deleted, but this generic bridge remains local
until a released upstream interface replaces it. Renderer module paths are a
temporary adapter boundary, not a proposed requirement for the final upstream API.

## Release/adoption ledger

All issue numbers below belong to <https://github.com/ubugeeei-prod/ox-content>.

| Issue                                                            | Downstream deletion target                                                    |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [#1315](https://github.com/ubugeeei-prod/ox-content/issues/1315) | Workarounds for missing public custom-host declaration exports.               |
| [#1316](https://github.com/ubugeeei-prod/ox-content/issues/1316) | Extension/discovery policy in `ox-content/content-assets.ts`.                 |
| [#1317](https://github.com/ubugeeei-prod/ox-content/issues/1317) | Renderer factory glue in `ox-content/island-renderer.ts`.                     |
| [#1318](https://github.com/ubugeeei-prod/ox-content/issues/1318) | Repeated collection asset planning in production generation.                  |
| [#1319](https://github.com/ubugeeei-prod/ox-content/issues/1319) | `ox-content/feed.ts` and dev-only feed response adapters.                     |
| [#1320](https://github.com/ubugeeei-prod/ox-content/issues/1320) | Markdown pipeline composition and its dev-host connection.                    |
| [#1321](https://github.com/ubugeeei-prod/ox-content/issues/1321) | `ox-content/virtual.d.ts`.                                                    |
| [#1322](https://github.com/ubugeeei-prod/ox-content/issues/1322) | Repeated glob/read/frontmatter discovery in `ox-content/island-documents.ts`. |
| [#1323](https://github.com/ubugeeei-prod/ox-content/issues/1323) | CSS href-to-filesystem reconstruction in `pages/home/styles.ts`.              |

Feed development output and stylesheet-content access are enhancement requests,
not claims that their current documented contracts are broken. Publication
selection, curated data, routes, layout, and homepage critical-CSS policy remain
site-owned even if upstream supplies their mechanics.

For each issue: verify a public package release, adopt the supported interface,
delete replaced implementation and redundant generic tests, verify site behaviour,
and update the PR. Issue closure alone does not complete adoption. Keep meaningful
site-policy and integration coverage rather than duplicating upstream unit tests.
