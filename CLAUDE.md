# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio and blog site built with Vite+, Ox Content, Svelte 5 islands, TypeScript, and Tailwind CSS v4. The site features:

- Static site generation for Cloudflare Pages deployment
- Markdown-based blog with rich content features
- Project showcases and OSS contributions
- RSS feed aggregation and generation

## Commands

### Development

- `pnpm dev` - Start development server with HMR
- `pnpm build` - Build the cached content artifact and production site
- `pnpm preview` - Preview production build
- `pnpm check` - Run Vite+ formatting, linting, and type checking
- `pnpm lint` - Run Vite+ linting
- `pnpm format` - Fix formatting and lint issues
- `pnpm test` - Run the Vitest suite through Vite+

### Content Management

- `pnpm new` - Interactive script to create a new blog post with frontmatter

## Architecture

The pnpm workspace separates content compilation from site assembly:

- Root package - Vite application, static page templates, client islands, redirects, feeds, and deployment
- `@ryoppippi/content` - Markdown sources, Ox Content pipeline, Tweet renderer, content artifact, and the new-post CLI
- Vite+ task graph - `site-build` depends on `@ryoppippi/content#build`, so unchanged content restores `packages/content/dist/content.json` from the task cache

### Content Structure

- Blog posts: `/packages/content/src/blog/` - Markdown files with frontmatter (title, date, isPublished, lang)
- Blog assets: `/packages/content/src/blog/[date]/` - Images for specific posts
- Project showcases: `/packages/content/src/showcase/` - Markdown with accompanying images
- OSS projects: `/src/contents/works/oss/list.json` - Curated list of GitHub projects
- External RSS: `/src/contents/external-rss/rss.json` - External blog feeds configuration

### Static Site Generation

- Routes and redirects are defined in `/routes.ts`
- `/packages/content/scripts/build.ts` writes the cached content artifact
- `/scripts/generate-site.ts` assembles static HTML after the Vite client build
- `/src/site/dev-server.ts` regenerates affected static pages and triggers HMR/full reloads in development

### Key Features Implementation

- **Markdown Processing**: Ox Content with syntax highlighting (Shiki), Japanese text (BudouX), social embeds, and GitHub alerts
- **RSS Generation**: Custom feed.xml route that combines blog posts and external RSS
- **Redirect Management**: Vite plugin for Cloudflare redirect rules

### Embedding Tweets in Blog Posts

Tweet embeds are NOT automatic from URLs. Use the `<Tweet />` island directly in Markdown:

1. Use `<Tweet id="..." />` with the tweet ID
2. Add the original URL as an HTML comment for reference

```md
---
title: Example
---

<!-- https://x.com/user/status/1234567890 -->
<Tweet id="1234567890" />
```

See `packages/content/src/blog/2024-10-12/index.md` for a full reference of available blog syntax (embeds, components, markdown features, etc.).

### Development Notes

- Vitest tests run through Vite+
- Uses pnpm workspaces with strict dependency management and per-package TypeScript configs
- TypeScript in strict mode
- Styling uses Tailwind CSS v4. Keep shared CSS in `src/styles/`, and colocate page-specific Tailwind entry CSS beside the route that imports it.
- For Svelte `class`, keep short static class lists as plain strings. For longer or dynamic class lists, use Svelte's array/object `ClassValue` syntax.
- Class arrays should be flat by default. Use nested arrays only for meaningful groups, such as responsive pairs, border/background pairs, typography groups, and hover/focus state groups.
- Do not wrap single utilities in nested arrays just to categorize them. Prefer readable utility order: layout, sizing, spacing, border/background, typography, color, state/transition.
- Icons are CSS icons from `@iconify/tailwind4`. Use the local `$components/Icon.svelte` wrapper with classes like `<Icon class='icon-[ph--heart]' aria-hidden='true' />`.
- Do not import icons from `~icons/...` or reintroduce `unplugin-icons`. Store content-driven icons as `icon-[collection--name]` strings.
- Prefer monotone icons that inherit `currentColor`. Use colored brand icons only when the visual design explicitly needs brand color.

### Svelte MCP

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

### Available MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyse the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyses Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
