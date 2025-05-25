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
- `pnpm format` - Fix linting issues

### Content Management

- `pnpm new` - Interactive script to create a new blog post with frontmatter

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
- **Image Optimisation**: Using `@sveltejs/enhanced-img` for responsive images
- **Component Auto-imports**: Configured via `sveltekit-autoimport` for components and icons
- **RSS Generation**: Custom feed.xml route that combines blog posts and external RSS
- **Redirect Management**: Vite plugin for Cloudflare redirect rules

### Development Notes

- No test framework is configured - the project focuses on static content
- Uses pnpm workspaces with strict dependency management
- TypeScript in strict mode
- Components are auto-imported - no need for manual imports
- Icon components available via unplugin-icons (e.g., `<IconRi:github-fill />`)
