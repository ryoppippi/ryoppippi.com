# Vite build comparison — 2026-09-09 evening

The requested comparison uses `node_modules/.bin/vpr --no-cache build` directly.
Vite's reported `built in` duration is recorded separately from command wall time.
All 18 builds generated 428 outputs, with no task-result cache hits. The existing
Ox Content 3.1.3 configurations were retained; this is not a 3.1.4 upgrade benchmark.

| Configuration   | Cold Vite median (range), ms | Warm Vite median (range), ms | Cold command median (range), s | Warm command median (range), s |
| --------------- | ---------------------------- | ---------------------------- | ------------------------------ | ------------------------------ |
| Solid v2        | 753 (690–1040)               | 722 (669–726)                | 4.113 (3.926–6.619)            | 4.113 (3.900–4.178)            |
| Official Svelte | 724 (626–884)                | 710 (653–728)                | 4.942 (4.463–5.946)            | 4.821 (4.536–5.124)            |
| rsvelte         | 682 (648–756)                | 652 (597–757)                | 4.647 (4.539–5.446)            | 4.630 (4.555–4.691)            |

rsvelte's Vite median is 42 ms (5.8%) shorter cold and 58 ms (8.2%) shorter warm
than official Svelte. Against Solid v2 the differences are 71 ms (9.4%) and
70 ms (9.7%). The ranges overlap: three samples per condition on a shared desktop
do not establish a stable ranking. All three have sub-second Vite medians.
Solid retains the shortest complete command median. Command wall time includes
the task runner, process startup, git-history task and custom-host SSG/network work;
the Vite log timer is the requested narrower measurement, not a compiler-only timer.
The two timers must not be substituted for each other.

## Browser payload

Every emitted JS/CSS file is byte-identical to its archived pre-run counterpart.
The representative home and chart article HTML are also unchanged. Therefore the
previous payload measurements still apply; these are gzip level 9 sizes, not the
different compression settings used by Vite's console size summary.

| Browser-loaded JS                            | Solid v2 gzip, bytes | Official Svelte gzip, bytes | rsvelte gzip, bytes |
| -------------------------------------------- | -------------------- | --------------------------- | ------------------- |
| Common page entry                            | 6,949                | 6,885                       | 6,887               |
| Chart chunk, including data and dependencies | 52,796               | 53,066                      | 53,110              |
| Framework runtime chunks                     | 46,327               | 14,924                      | 14,903              |
| Total for the chart article                  | 106,072              | 74,875                      | 74,900              |

| HTML + JS + CSS, including chart lazy imports | Solid v2 gzip, bytes | Official Svelte gzip, bytes | rsvelte gzip, bytes |
| --------------------------------------------- | -------------------- | --------------------------- | ------------------- |
| Home                                          | 23,672               | 23,683                      | 23,687              |
| Chart article                                 | 159,040              | 127,635                     | 127,660             |

These are cold-cache payload estimates, excluding image/font binaries, HTTP
headers and transport overhead. Previously observed browser requests establish
the lazy import set; this run verifies unchanged artifacts rather than repeating
browser interaction tests.

The chart chunks are nearly equal. Almost all the JS difference is in the emitted
runtime chunks. Ox Content 3.1.3's Solid adapter loads module namespaces through
`Promise.all([import('@solidjs/web'), import('solid-js')])`, and the generated
runtime chunks retain broad public exports, including APIs the chart does not
directly call. The Svelte loader destructures a direct `import('svelte')`.
The controlled experiment below shows that this loader accounts for almost all
of the observed JS gap. These numbers do not establish an intrinsic
Solid-versus-Svelte runtime-size difference.

The emitted JS count of 18 versus 3 is also not the browser request count:
Solid emits 14 CSS-extraction helper JS files totalling 2,970 gzip bytes that
this article does not load. The article loads 4 JS files with Solid and 3 with
Svelte. CSS counts fall from 19 to 6 partly because scoped CSS moves into HTML.

## Controlled Solid loader experiment

In the disposable Solid benchmark checkout, a temporary Vite transform changed
only the adapter's two dynamic import targets. Each target was a virtual module
with named re-exports:

```ts
// First module
export { render, hydrate } from '@solidjs/web';
// Second module
export { createComponent } from 'solid-js';
```

The loader still uses `Promise.all`; the chart, compiler, runtime versions, CSS
and content are unchanged. This makes the public exports visible to the bundler
without modifying installed packages. The build recorded exactly one loader
replacement and generated all 428 outputs. The original configuration and `dist`
were restored afterwards; the application PR does not adopt this experiment.

| Browser payload, gzip bytes                       | Original Solid loader | Narrow Solid loader | rsvelte baseline |
| ------------------------------------------------- | --------------------- | ------------------- | ---------------- |
| Common page entry                                 | 6,949                 | 7,002               | 6,887            |
| Chart chunk                                       | 52,796                | 52,724              | 53,110           |
| Runtime chunks, including experimental shim files | 46,327                | 16,726              | 14,903           |
| Total loaded JS                                   | 106,072               | 76,452              | 74,900           |
| Article HTML + JS + CSS                           | 159,040               | 129,420             | 127,660          |

Changing the loader removes 29,620 gzip bytes, **95.0% of the original 31,172-byte
JS gap**. The residual JS difference is only 1,552 bytes. The effect is primarily
tree-shaking of the runtime: Solid core drops from 31,872 to 12,317 bytes, and
the web chunk from 14,455 to 4,238 bytes. Two small shim chunks add 171 bytes.
The chart chunk barely changes.

This is a bundle-size experiment, not a fourth timing configuration or a
production-ready optimisation. The six JS files in the experimental import graph
were counted, including both shims. The graph comes from the Vite manifest;
browser interaction/hydration was not retested for this variant. Functional
validation would be required before adopting such a loader. The three requested
timing configurations above are unchanged.

The conclusion is that Ox Content 3.1.3's broad Solid imports substantially
inflate this site's bundle. It does not show that Svelte is inherently smaller
than Solid, or establish a general ranking between their runtimes. The full
experimental plugin, before/after manifests and per-chunk sizes are recorded in
[solid-loader-2026-09-09.json](./solid-loader-2026-09-09.json).

## Conditions and reproduction

- Apple M5 Max, 18 logical CPUs, arm64 macOS (Darwin 25.6.0), AC power connected;
  AC power mode reported `0` (automatic), not an explicitly forced high-power mode.
  Other desktop activity was not controlled.
- Three cold/warm pairs per configuration, executed serially. Order rotates:
  Solid → official → rsvelte, official → rsvelte → Solid, rsvelte → Solid → official.
  File copying, verification, dependency checks and compression are outside timing.
- Cold removes `dist`, `node_modules/.vite` and `node_modules/.vite-temp`. Warm
  removes `dist` only. Installed dependencies, remote-content and OS caches remain;
  this does not describe a completely empty cache. `PUBLIC_ORIGIN` is
  `https://ryoppippi.com`, `CI=false`; every task log reports 0/2 cache hits.
- Exact versions remain those in the [earlier report](./frameworks-2026-09-09.md):
  Ox Content 3.1.3; Solid runtime/native compiler 2.0.0-rc.4 with plugin
  3.0.0-next.36; Svelte 5.57.0 with official plugin 7.2.0 or rsvelte plugin
  0.5.2/native compiler 0.3.12; Vite+ 0.3.0. The installed shims select Node
  24.20.0; the harness uses Node 24.19.0. No `pnpm exec` wraps the timed command.
- The rsvelte application is based on `adb20414c943fad9731b8cdae0aea174662a7ff3`;
  Solid uses the preserved `3a06e10c` baseline with Ox Content 3.1.3. The official
  Svelte copy uses the equivalent migration sources with only the compiler plugin
  changed. Lockfile/configuration hashes are recorded in the raw results.
- Two other article HTML outputs changed since the afternoon snapshots, in all
  three configurations (`2024-10-19` and `2026-01-07-recap-2025-ja`). The SSG pipeline
  can render time-sensitive/remote content; no timing or site-wide HTML-size claim
  assumes all generated content is immutable. Authored content remains fixed.
- Preserve the earlier full-command samples as historical measurements; the
  different command, power conditions and timing boundaries prevent interpreting
  their difference as a measured `pnpm exec` overhead.

```sh
direnv exec . node scripts/benchmark-vite.mjs \
  /tmp/new-vite-benchmark-results \
  /path/to/solid-v2 /path/to/svelte-official /path/to/rsvelte
```

Use a new output directory. The runner archives the previous outputs before
clearing caches and preserves every build log. Raw samples and artifact checks
are in [vite-build-2026-09-09.json](./vite-build-2026-09-09.json).
