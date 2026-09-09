# Framework benchmark — 2026-09-09

All three configurations generated 428 outputs and 81 HTML files. Browser checks found one hydrated GTV chart, one SVG and 18 evidence rows in each, with the same keyboard/live-readout response.

| Configuration   | Cold SSG median (range), s | Warm SSG median (range), s | JS files | JS raw / gzip / Brotli, bytes | CSS raw / gzip / Brotli, bytes | HTML raw / gzip / Brotli, bytes |
| --------------- | -------------------------- | -------------------------- | -------- | ----------------------------- | ------------------------------ | ------------------------------- |
| solid-v2        | 3.884 (3.680–6.664)        | 3.756 (3.663–3.818)        | 18       | 312,183 / 109,042 / 96,340    | 158,476 / 32,476 / 27,452      | 3,580,114 / 691,804 / 561,588   |
| svelte-official | 4.929 (4.641–4.950)        | 4.615 (4.535–5.221)        | 3        | 211,563 / 74,875 / 65,732     | 132,938 / 23,084 / 19,802      | 3,979,785 / 792,825 / 646,835   |
| rsvelte         | 4.405 (4.311–4.608)        | 4.441 (4.201–4.707)        | 3        | 211,603 / 74,900 / 65,792     | 132,938 / 23,084 / 19,802      | 3,979,785 / 792,873 / 647,001   |

| Configuration   | Home HTML gzip | Home initial JS+CSS gzip | Article HTML gzip | Article initial JS+CSS gzip | Article lazy JS gzip | Article JS+CSS after hydration gzip |
| --------------- | -------------- | ------------------------ | ----------------- | --------------------------- | -------------------- | ----------------------------------- |
| solid-v2        | 4,652          | 19,020                   | 28,458            | 31,459                      | 99,123               | 130,582                             |
| svelte-official | 4,727          | 18,956                   | 29,676            | 29,969                      | 67,990               | 97,959                              |
| rsvelte         | 4,729          | 18,958                   | 29,676            | 29,971                      | 68,013               | 97,984                              |

Compared with official Svelte, rsvelte changes cold build median by -10.63%, warm median by -3.77%, and gzip JS by 0.03% (25 bytes). The observed timing advantage is specific to these samples; three sequential samples on a shared desktop do not establish a general compiler-speed advantage. Compared with Solid v2, rsvelte's aggregate gzip JS changes by -31.31%. This is a whole-site migration comparison, not an isolated compiler result.

The pre-adoption rsvelte baseline at f1b744f3 (Ox Content 3.1.2, local adapters) measured cold 3.721 s and warm 3.653 s, with 73,944 gzip JS bytes. Adopting the public 3.1.3 adapters changes those by 18.37%, 21.57%, and 1.29% respectively. It adds the upstream lazy-loading/error contract; it is not reported as a performance improvement.

## Method and limitations

- Apple M5 Max, 18 logical CPUs, arm64, Darwin 25.6.0. Build Node 24.20.0, pnpm 11.20.0, Vite+ / Vite core 0.3.0; timing harness Node 24.19.0. All three use Ox Content 3.1.3 and equivalent authored content (86 Markdown/JSON files; only the chart import extension differs). Both Svelte configurations set `ssr.noExternal` for `@ox-content/vite-plugin-svelte` to keep server runtime state aligned.
- Solid: runtime/compiler 2.0.0-rc.4, @solidjs/vite-plugin 3.0.0-next.36 with compiler: native, sources based on 3a06e10c. Svelte: runtime 5.57.0, 24 byte-identical Svelte/rune source files, @sveltejs/vite-plugin-svelte 7.2.0 versus @rsvelte/vite-plugin-svelte 0.5.2 with native compiler 0.3.12. The latter calls the native compile function; the former calls svelte/compiler. Svelte measurements use the adoption changes in this PR on measurement base f1b744f3.
- Each sample executes `PUBLIC_ORIGIN=https://ryoppippi.com CI=false pnpm exec vp build`, bypassing the Vite+ task result cache. Three cold/warm pairs run sequentially per configuration; installations and compression are outside timing.
- Cold clears `dist`, `node_modules/.vite` and `node_modules/.vite-temp`; warm retains the previous Vite cache and clears `dist`. Remote-content caches are seeded from the same snapshot and retained. This is compiler-cache cold, not an empty dependency/content/OS cache. The dotfiles README fetch remains in the actual full SSG build, so network variation is included. The shared desktop is not a dedicated benchmark machine.
- Solid uses its existing external CSS Modules; both Svelte variants use the same injected scoped CSS mode because upstream #1389 blocks reliable external scoped-CSS extraction. HTML totals therefore matter alongside CSS totals. This measures equivalent site implementations, not identical framework source or a compiler-only microbenchmark.
- Sizes use gzip level 9 and Brotli quality 11, compressing each emitted file separately. Aggregate JS includes emitted SSR stylesheet helper chunks even if no page loads them.
- Page columns are payload-size estimates from generated HTML references and browser-observed article requests. They exclude HTTP headers, images, fonts, cache reuse and transport timing. Home does not load an island runtime. Article lazy chunks are separated from initial HTML-linked assets; all were observed returning HTTP 200. These are not network latency, hydration duration or Core Web Vitals results.
- One validation run hit the existing 5-second test timeout under desktop load; an unchanged rerun passed all 39 tests.

## Reproduce

Use isolated checkouts with the versions above and the same content-cache snapshot. For Svelte official, change only the Vite plugin import and install its pinned plugin; keep Svelte source/runtime/CSS options unchanged. For Solid, use the 3a06e10c site with the Ox Content catalogue updated to 3.1.3. Run each configuration sequentially:

```sh
direnv exec . node scripts/benchmark-site.mjs /path/to/checkout rsvelte /tmp/framework-results
```

Raw runs, manifests, version information and byte counts are in [frameworks-2026-09-09.json](./frameworks-2026-09-09.json).
