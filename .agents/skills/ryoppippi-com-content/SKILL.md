---
name: ryoppippi-com-content
description: Guides content changes in the ryoppippi.com repository, including blog Markdown, post-local Solid islands, Tweet embeds, and curated OSS metadata.
---

Use this skill for `ryoppippi/ryoppippi.com`. Treat the implementation and tests as the source of truth.

For discovering and updating external articles, podcasts, or YouTube appearances, use `ryoppippi-com-media` first.

## Blog posts

- Blog posts live under `src/content/blog/<slug>/index.md`.
- Read `src/content/blog/2024-10-12/index.md` for the supported Markdown extensions and frontmatter shape.
- Tweet embeds are explicit: `<Tweet id="1234567890" />`. Keep the original URL in an HTML comment; a URL alone does not create an embed.
- Ox Content stores fetched Tweet records under `.cache/ox-content/twitter/` and self-hosted media under `static/ox-content/twitter/`. Do not hand-edit them; run `pnpm build` after changing an embed and commit the generated evidence it requires.

## Post-local islands

- Put components beside the post inside the blog tree. A supported island import is a capitalised default import from a relative `.tsx` path, such as `import Chart from './Chart.tsx'`, outside fenced code.
- Use the import binding as the component tag, such as `<Chart />`. Props use Ox Content syntax: quoted strings, JSON in braces, or bare boolean attributes.
- Resolved imports are removed from rendered Markdown; missing imports and unknown tags remain visible, so fix the path instead of hiding the error.
- Read `src/content/islands.ts`, `src/content/island-renderer.ts`, and `src/content/markdown/render.ts` when the accepted syntax, path resolution, or SSR boundary is unclear.
- Run `pnpm new` to create a post through `scripts/new-post.ts`; content rendering is part of the root Vite build.

## Portfolio data

- Edit `src/contents/works/oss/list.json` for portfolio curation and follow `src/contents/works/oss/README.md`.
- Do not hand-edit `src/contents/works/oss/stars.json`; refresh it with `pnpm update:oss-stars` when requested.
