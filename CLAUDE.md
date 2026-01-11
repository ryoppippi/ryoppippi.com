# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio and blog site built with SvelteKit, TypeScript, and UnoCSS. The site features:

- Static site generation for Cloudflare Pages deployment
- Markdown-based blog with rich content features
- Project showcases and OSS contributions
- RSS feed aggregation and generation

## Commands

### Development

- `pnpm dev` - Start development server with HMR
- `pnpm build` - Build for production (includes sitemap generation)
- `pnpm preview` - Preview production build
- `pnpm check` - Run svelte-check and TypeScript type checking
- `pnpm lint` - Run ESLint
- `pnpm format` - Fix linting issues (runs `nr lint --fix`)

### Content Management

- `pnpm new` - Interactive script to create a new blog post with frontmatter

### Additional Commands

- `pnpm check:watch` - Watch mode for svelte-check and TypeScript type checking
- `pnpm sync` - Run svelte-kit sync
- `pnpm taze` - Update dependencies interactively

## Architecture

### Content Structure

- Blog posts: `/src/contents/blog/` - Markdown files with frontmatter (title, date, isPublished, lang)
- Blog assets: `/src/contents/blog/[date]/` - Images for specific posts
- Project showcases: `/src/contents/projects/showcase/` - Markdown with accompanying images
- OSS projects: `/src/contents/projects/oss/list.json` - Curated list of GitHub projects
- External RSS: `/src/contents/external-rss/rss.json` - External blog feeds configuration

### SvelteKit Routing

- File-based routing in `/src/routes/`
- Server-side data loading with `+page.server.ts`
- Static adapter with full prerendering
- Custom error page at `+error.svelte`

### Key Features Implementation

- **Markdown Processing**: Custom preprocessor with plugins for syntax highlighting (Shiki), Japanese text (BudouX), social embeds, and GitHub alerts
- **RSS Generation**: Custom feed.xml route that combines blog posts and external RSS
- **Redirect Management**: Vite plugin for Cloudflare redirect rules

### Development Notes

- No test framework is configured - the project focuses on static content
- Uses pnpm workspaces with strict dependency management
- TypeScript in strict mode
- Components use `$components` path alias for imports
- Icon components available via unplugin-icons (e.g., `<IconRi:github-fill />`)

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
