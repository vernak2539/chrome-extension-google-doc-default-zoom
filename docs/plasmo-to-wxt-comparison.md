# Plasmo → WXT: bundle and load comparison

Measured on 2026-11-20 to answer one question: did moving the build from Plasmo to WXT make the extension bigger, slower, or both?

The comparison is same-source: the WXT branch has `main` merged, and the Plasmo baseline is `main` at `dac44a0` (Plasmo with `--hoist`, including the #154 content-error change). Both builds ship the same features.

- **Plasmo baseline:** `origin/main` @ `dac44a0`, built with `pnpm build:base|extended --target=chrome-mv3` (no `--source-maps`; `main`'s scripts do not pass it).
- **WXT:** this branch, built with `pnpm package:base|extended -b chrome`.

Chrome MV3 is shown. Edge MV3 and Firefox MV2 (Base only) differ by at most 3 bytes in the numbers below.

## Bundle sizes

Raw bytes and gzip level 6 (matching PR #122's `gzip -c`). `P → W` is Plasmo → WXT.

Page bundles are the sum of every JS file the page's HTML loads: the entry `<script>` plus `modulepreload` links. That makes them comparable with Plasmo's single-file page bundles, even though WXT splits shared code into chunks.

### Base edition

| Bundle                                   | Raw P → W             |      Δ raw | Gzip P → W            |     Δ gzip |
| ---------------------------------------- | --------------------- | ---------: | --------------------- | ---------: |
| content                                  | 10,176 → 15,539       |     +52.7% | 4,012 → 5,648         |     +40.8% |
| popup (1 → 3 files)                      | 324,892 → 312,549     |      −3.8% | 105,896 → 103,473     |      −2.3% |
| background                               | 80,488 → 89,949       |     +11.8% | 27,254 → 30,631       |     +12.4% |
| tab: experimental-features (1 → 2 files) | 222,216 → 227,358     |      +2.3% | 72,286 → 74,504       |      +3.1% |
| tab: ext-versions (1 → 3 files)          | 223,596 → 228,842     |      +2.3% | 72,696 → 75,086       |      +3.3% |
| **total JS shipped**                     | **861,368 → 421,608** | **−51.1%** | **282,144 → 141,014** | **−50.0%** |

### Extended edition

| Bundle                                   | Raw P → W             |      Δ raw | Gzip P → W            |     Δ gzip |
| ---------------------------------------- | --------------------- | ---------: | --------------------- | ---------: |
| content                                  | 10,211 → 15,539       |     +52.2% | 4,019 → 5,645         |     +40.5% |
| popup (1 → 3 files)                      | 324,901 → 312,558     |      −3.8% | 105,899 → 103,479     |      −2.3% |
| background                               | 81,233 → 90,672       |     +11.6% | 27,499 → 30,865       |     +12.2% |
| tab: experimental-features (1 → 2 files) | 222,217 → 227,359     |      +2.3% | 72,286 → 74,505       |      +3.1% |
| tab: ext-versions (1 → 3 files)          | 223,597 → 228,843     |      +2.3% | 72,698 → 75,085       |      +3.3% |
| **total JS shipped**                     | **862,159 → 422,340** | **−51.0%** | **282,401 → 141,249** | **−50.0%** |

### Package totals

| Metric                         | Base P → W                     | Extended P → W                 |
| ------------------------------ | ------------------------------ | ------------------------------ |
| Build directory, maps excluded | 1,020,086 → 583,338 (−42.8%)   | 1,024,243 → 587,441 (−42.6%)   |
| Chrome zip                     | 340,255 → 184,961 (**−45.6%**) | 343,844 → 188,559 (**−45.2%**) |
| Source maps in zip             | 0 → 0                          | 0 → 0                          |

Both zips are map-free, so the zip gap is payload, not stripped source maps. The Plasmo build in the comparison worktree produced no maps because `main`'s build scripts do not pass `--source-maps`; WXT writes maps next to the bundles and excludes them from the zip.

### Where the bytes go (Extended, maps excluded)

| Part            |  Plasmo |     WXT |      Δ |
| --------------- | ------: | ------: | -----: |
| JS              | 862,159 | 422,340 | −51.0% |
| CSS             |  86,647 |  90,001 |  +3.9% |
| `_locales`      |  56,195 |  56,195 |     0% |
| Icons           |  16,264 |  16,264 |     0% |
| HTML + manifest |   2,267 |   2,641 | +16.5% |
| Other           |     711 |       0 |  −100% |

"Other" in the Plasmo build is the two popup icon SVGs (`docs.svg` at 325 bytes and `sheets.svg` at 386 bytes). WXT inlines both into its CSS, which is why its "other" is empty and its CSS is slightly larger.

## Load latency

Headless Chromium on macOS, 20 runs per build. The first run is reported separately as **cold**; median and p95 use the 19 warm runs. Every content-script run asserts that the clicked row was `"150%"`, so the comparison cannot be skewed by one build clicking a different row.

- **Popup:** navigation start → both app selects rendered.
- **Tab page:** navigation start → page heading rendered (`ext-versions.html`, or `tabs/ext-versions.html` for Plasmo).
- **Content script:** in-page `performance.now()` from fixture DOM insertion → `.goog-menuitem` click event (the 500 ms settle wait before insertion is excluded).

| Edition  | Load    | Cold P → W     | Warm median P → W |             Δ median | Warm p95 P → W |
| -------- | ------- | -------------- | ----------------- | -------------------: | -------------- |
| Base     | popup   | 62.8 → 50.0 ms | 24.3 → 24.3 ms    |        0.0 ms (0.0%) | 26.3 → 27.3 ms |
| Base     | tab     | 25.5 → 21.1 ms | 18.4 → 18.7 ms    |      +0.3 ms (+1.6%) | 21.9 → 21.7 ms |
| Base     | content | 23.9 → 10.7 ms | 23.3 → 15.4 ms    | **−7.9 ms (−33.9%)** | 24.2 → 16.2 ms |
| Extended | popup   | 59.9 → 50.6 ms | 24.3 → 24.7 ms    |      +0.4 ms (+1.6%) | 29.0 → 30.5 ms |
| Extended | tab     | 26.0 → 23.1 ms | 18.5 → 18.4 ms    |      −0.1 ms (−0.5%) | 22.0 → 19.7 ms |
| Extended | content | 24.4 → 14.7 ms | 23.7 → 15.7 ms    | **−8.0 ms (−33.8%)** | 24.7 → 16.6 ms |

Cold values are single samples and should not be read as precise. Warm medians are stable across editions and repeated runs.

## Reading the results

**Improvement overall.** The packaging win is large and comes from deduplication: Plasmo's hoisted output repeats React, react-aria and friends in every page bundle; WXT emits shared chunks once. Per-page runtime payload is nearly flat, and the one user-facing interaction that changed materially got faster.

- **Installed/downloaded size:** zip −45%, build directory −43%, total JS −50%.
- **Popup:** unchanged (~24 ms warm median); cold open ~10–13 ms faster.
- **Tab pages:** parity (~18.5 ms warm median); the +2 ms gzip payload does not show up as latency.
- **Content-script zoom:** ~8 ms / ~34% faster. This is the relay removal: Plasmo posts to the page and then to the background; WXT sends one typed `runtime.sendMessage` directly.
- **Regressions:** content bundle +1.6 KB gzip, background +3.4 KB gzip, tab pages +2.2 KB gzip. The content growth is the `@webext-core/messaging` client replacing the relay shim; the background growth is that runtime plus WXT storage. The #154 Sentry error handler is present in both baselines, so it is not part of the delta.

## Reproduce

```bash
# Plasmo baseline, from the repository root. `package` builds the directory and the zip.
git worktree add --detach /tmp/plasmo-compare origin/main
(cd /tmp/plasmo-compare \
  && pnpm install --frozen-lockfile \
  && pnpm package:base --target=chrome-mv3 \
  && pnpm package:extended --target=chrome-mv3)

# WXT (this branch), still in the repository root
pnpm package:base -b chrome
pnpm package:extended -b chrome
```

Measure page JS by parsing each built HTML file for `<script src>` and `<link rel="modulepreload">`, then summing those files. Gzip with level 6. For latency, load each build with Playwright (`channel: "chromium"`, `--load-extension`), seed `docs` with `zoomValue: "150%"` in the build's own storage format (Plasmo: JSON text and `schemaVersion: "2"`; WXT: plain values and `schemaVersion: 2`), and use the same readiness criteria described above.

## Caveats

- Headless Chromium, one machine, no CPU throttling; treat differences under ~2 ms as noise.
- Cold latency is one sample per build.
- The Plasmo baseline is `main` @ `dac44a0`, which includes #154. Do not compare these numbers with PR #122's earlier hoisting numbers: #122 predates #154, when Sentry still lived in the content script.
- These are microbenchmarks, not field metrics. Use them to spot regressions, not to predict real-store install times.
