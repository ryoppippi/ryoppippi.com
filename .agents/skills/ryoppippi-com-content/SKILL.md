---
name: ryoppippi-com-content
description: Guides content changes in the ryoppippi.com repository, including blog Markdown, post-local Solid islands, Tweet embeds, and curated OSS metadata.
---

Use this skill for `ryoppippi/ryoppippi.com`. Treat the implementation and tests as the source of truth.

For discovering and updating external articles, podcasts, or YouTube appearances, use `ryoppippi-com-media` first.

## Blog posts

- Blog posts live under `src/content/blog/<slug>/index.md`.
- Read a nearby existing post for the supported Markdown extensions and frontmatter shape.
- Tweet embeds are explicit: `<Tweet id="1234567890" />`. Keep the original URL in an HTML comment; a URL alone does not create an embed.
- Treat Ox Content's fetched Tweet records and self-hosted media as generated artifacts. Do not hand-edit them; run `direnv exec . pnpm build` after changing an embed and commit the generated evidence it requires.

## Translation and spelling

- Preserve the source's meaning and voice. Keep frontmatter structure, code, links, HTML comments, and custom components intact; translate only human-facing text.
- Write English in British English. For a bilingual pair, update `lang`, `permalink`, and `alternates` consistently; read an existing `-ja` and `-en` pair for the current shape.
- Run `direnv exec . pnpm typos` after editing prose. Fix real errors in the source; add a term to `typos.toml` only when it is an intentional name or technical term.

## Post-local islands

- Put components beside the post inside the blog tree. A supported island import is a capitalised default import from a relative `.tsx` path, such as `import Chart from './Chart.tsx'`, outside fenced code.
- Use the import binding as the component tag, such as `<Chart />`. Props use Ox Content syntax: quoted strings, JSON in braces, or bare boolean attributes.
- Resolved imports are removed from rendered Markdown; missing imports and unknown tags remain visible, so fix the path instead of hiding the error.
- When the accepted syntax, path resolution, or SSR boundary is unclear, inspect the current blog rendering implementation and its tests instead of relying on fixed internal paths.
- Run `direnv exec . pnpm new` to create a post; content rendering is part of the root Vite build.

## Portfolio data

- Edit `src/contents/works/oss/list.json` for portfolio curation and follow `src/contents/works/oss/README.md`.
- Do not hand-edit `src/contents/works/oss/stars.json`; refresh it with `pnpm update:oss-stars` when requested.
