# OSS project curation

`list.json` is a curated portfolio, not a mirror of every public repository.
The page should make the projects that best represent the work easy to find.

## Selection criteria

Keep a project when at least one of these is true:

- it is a representative project with meaningful adoption, community attention,
  or another visible outcome;
- it is actively used in the site, dotfiles, or another maintained project;
- it demonstrates a distinctive area of work, such as AI tools, Nix,
  Vim/Neovim, the web ecosystem, TypeScript libraries, Zig, or shell tooling;
- it records a meaningful upstream contribution. Link to the upstream project
  and make the description explicit, for example, `Contributions to ...`.

Stars are a signal, not a hard threshold. Usage, maintenance, technical
distinctiveness, and historical importance can justify keeping a project with
few stars.

## Leave projects out when

- the project is a small experiment, template, fork, or one-off demo without a
  strong portfolio signal;
- it is archived or unmaintained and has little adoption or historical value;
- it is no longer used and is not otherwise representative of the work;
- the same web app or visual experiment already has a page in Showcase;
- the entry only points at an old repository name; update it to the current
  canonical name and URL instead of keeping a stale duplicate.

Removing a project from this list does not remove its repository, package, or
blog post. This file only controls the curated OSS index.

## OSS and Showcase

- **OSS**: reusable libraries, developer tools, plugins, configurations, and
  upstream ecosystem contributions.
- **Showcase**: web apps, visual demos, experiments, and projects where the
  demo or implementation story is the main point.

Do not list the same web app in both places unless the OSS entry represents a
separate reusable library or tool.

## Editing checklist

Before adding or retaining an entry:

1. Check the current repository name, URL, archive state, recent activity, and
   stars on GitHub.
2. Check whether the project is used by this site, dotfiles, or another current
   project.
3. Prefer a concise description that says what the project does. A command such
   as `npx ccusage` may remain as a marketing hook, but follow it with the
   project's value or purpose.
4. Keep the category order intentional: current focus areas come first, and
   categories should not be created for a single low-signal entry.
5. Revisit stale entries when the OSS index changes; do not let the list become
   an uncurated archive.
