# Page ownership

Directories describe public URL paths: the root page lives here, `404.html/`
produces `/404.html`, and `blog/[slug]/` produces content-derived article URLs
and their Markdown companions. Brackets document a dynamic segment; route
modules still enumerate outputs from the content catalogue, not directory names.

Keep each endpoint's `index.ts`, named page component, styles and data loaders
together. Page components are Svelte files with scoped `<style>` blocks, such as
`Home.svelte`. rsvelte compiles them; their SSR head includes styles before scripts run.
Feed item mapping stays with the blog or media data it publishes; Ox Content writes feeds.

Shared build/dev lifecycle code belongs in `src/utils/ssg`, reusable UI in
`src/components`, and authored documents and media in `src/content`.
Homepage critical CSS inlining also lives in `utils/ssg/home-styles.ts`.
Use `@/` imports across these boundaries and relative imports within a directory.
Modules loaded by `vite.config.ts` before Vite's alias resolver starts must keep
runtime imports relative; page-rendering modules use the alias normally.
