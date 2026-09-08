---
name: ryoppippi-com-testing
description: Guides test selection and browser verification for ryoppippi.com. Use when changing tests, verifying UI behaviour, or introducing browser regression coverage.
---

## Choose the smallest useful check

- Read `vite.config.ts`, `package.json`, `flake.nix` and `.github/workflows/ci.yaml` before changing the test setup.
- Run checks in the project environment: `direnv exec . pnpm check`, `direnv exec . pnpm test`, and `direnv exec . pnpm build` as appropriate.
- Keep site-owned behaviour covered. Do not duplicate Ox Content tests or test a pass-through wrapper; remove redundant coverage when adopting upstream functionality.
- Use in-source `test` / `test.each` for non-browser behaviour, without redundant `describe` wrappers. Keep test bodies free of conditional branches and try/catch. Prefer real fixtures or MSW over fetch spies.

## Browser verification

- For one-off UI verification in Codex Desktop, use the installed Browser plugin with the in-app browser. No project Playwright dependency is needed for that.
- Use a fresh dev server after changing host/configuration boundaries. Verify actual rendered content and interactions, not only an HTTP 200; check non-HTML endpoints' Content-Type separately.
- Add a persistent browser test only for a site-owned regression that needs real DOM layout, CSS, or browser interaction. Name it `*.browser.test.ts` beside the owning feature; keep it out of the Node project.

## When persistent browser tests are needed

- Do not keep an empty browser project or unused direct Playwright dependency. Introduce the runner with the first meaningful regression test.
- Add `@vitest/browser-playwright` and its required Playwright driver through `pnpm-workspace.yaml`'s catalogue; keep package entries as `catalog:`. Match the provider to the installed Vitest version and consult installed package documentation first, then https://vitest.dev/guide/browser/ if needed.
- Configure a separate headless Chromium browser project in `vite.config.ts`; include it in the normal test command and exclude `*.browser.test.ts` from Node collection. Use the `vitest-testing` skill for test structure.
- Neither Nix shell provisions Playwright browsers while there are no browser tests. With the first browser test, add local browser provisioning through `pkgs.playwright-driver.browsers` and `PLAYWRIGHT_BROWSERS_PATH`. These supply executables, not an importable JS package; match the driver's expected browser revision to the pinned Nix input. Do not download replacement browsers into the local Nix environment.
- Provision compatible Linux browsers and system libraries for the separate CI shell in the same change. Consult the driver's installed CLI help and https://playwright.dev/docs/ci rather than assuming the default dev shell covers CI.
- Run the new browser test, the full suite and a production build. When the final browser test is removed, remove its project, direct dependencies, Nix browser provisioning/environment variables and CI browser-install step together.
