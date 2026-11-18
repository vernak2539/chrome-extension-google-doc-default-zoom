# Browser tests against Docs and Sheets markup (`e2e/`)

The unit tests fake the DOM the zoom flow drives. These tests load the **built extension** in headless Chromium and check what the content script does to Google-shaped pages: which menu row it clicks, and what the Extended edition types into the zoom box.

There are two modes:

| Mode        | Command              | Pages                                                                                        | Runs                                    |
| ----------- | -------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------- |
| **Fixture** | `pnpm test:e2e`      | Saved markup in [`e2e/fixtures/`](../e2e/fixtures), served as `docs.google.com`. No network. | Every pull request (`sanity-check.yml`) |
| **Live**    | `pnpm test:e2e:live` | The maintainer's public Doc and Sheet, **signed out**. The harness never signs in to Google. | Weekly and on demand (`e2e-live.yml`)   |
| Capture     | `pnpm e2e:capture`   | Opens the same public pages signed out, saves them, and sanitizes them into `e2e/fixtures/`. | By hand, or in `e2e-live.yml`           |

The fixture tests cover a preset zoom (Docs and Sheets), a custom zoom (Extended only), the Docs view-only flow, and a page that is still loading. Every browser test runs once per edition, like `pnpm test`: `e2e/vitest.config.ts` has a `base` and an `extended` project, each loading `build/chrome-mv3-<edition>`. In the Base edition the custom-zoom test is replaced by one that checks nothing is clicked or typed.

The browser tests are named `*.e2e.ts` and use their own config (`e2e/vitest.config.ts`), so `pnpm test` does not collect them. `e2e/fixture-sanitize.test.ts` is a normal unit test and runs with `pnpm test`.

## Run it locally

```bash
pnpm install
pnpm exec playwright install --with-deps chromium   # once
pnpm build:base --target=chrome-mv3                  # without PLASMO_PUBLIC_SENTRY_DSN set
pnpm build:extended --target=chrome-mv3
pnpm test:e2e                                        # both editions
pnpm test:e2e --project extended                     # one edition
```

- The build must not contain the Sentry DSN. The harness refuses to start when a built file does, so a test run never reports to the real Sentry project.
- Each project checks that its build is the edition it expects (`debugger` permission means Extended). A dev build (`pnpm dev`) writes to the same directory, so rebuild after one.
- Set `E2E_EXTENSION_DIR` to test a build in another directory, together with `--project` for its edition. The default is `build/chrome-mv3-<edition>`.
- Screenshots of failed tests go to `e2e/results/screenshots/`.

### Live mode

```bash
pnpm test:e2e:live                    # both editions
pnpm test:e2e:live --project base     # one edition
```

Set `E2E_LIVE_DOC_URL` and `E2E_LIVE_SHEET_URL` to use other public documents. If a page is blocked or has no zoom control, the failure message lists the selectors that were found (`#docs-chrome`, `#zoomSelect`, `#t-zoom`, `#docs-view-menu`, ...).

## Capture and refresh the fixtures

The fixtures that ship with this change are **synthetic**: written from the selectors in `src/constants.ts` and the strategies, with a header saying so. A fixture only protects against Google changing its markup once it is captured from the real page, so replace them.

1. `pnpm exec playwright install --with-deps chromium` (once).
2. `pnpm e2e:capture`. This opens the public Doc and Sheet signed out, waits for the zoom control to be enabled, opens the zoom menu (View > Zoom for the view-only fixture), and saves the raw page to `e2e/results/raw/` (gitignored, never uploaded). It then sanitizes each page into `e2e/fixtures/<name>.html`.
3. Review `git diff e2e/fixtures`. Look for anything that is not UI markup.
4. `pnpm exec vitest run e2e/fixture-sanitize.test.ts` (checks that each fixture has what the extension needs and no leaks).
5. Commit `e2e/fixtures/`.

Instead of steps 1 and 2, you can download the `fixtures` artifact of a run of the `E2E live` workflow ([`.github/workflows/e2e-live.yml`](../.github/workflows/e2e-live.yml), weekly or started by hand), copy its files into `e2e/fixtures/`, and continue at step 3.

Capture fails, and writes nothing, when:

- the zoom control or the View menu never becomes enabled (the message names the selectors that were found). For the editor fixtures the public Doc and Sheet have to allow editing signed out. A view-only page has no `#zoomSelect` or `#t-zoom`;
- a required selector is missing after sanitizing;
- the sanitized markup still holds a script, iframe, svg, `on*` attribute, URL or email address.

A failing target does not stop the others: `pnpm e2e:capture` always runs the sanitize step, which skips a target that has no raw file (its fixture keeps its previous content), and then exits non-zero if any capture failed. Both Docs fixtures come from the same Doc, so a Doc that is view-only signed out fails `docs-editor` while `docs-view-only` and the Sheet are still refreshed. Set `E2E_LIVE_DOC_URL` to an editable public Doc if you need the editor fixture too.

### What the sanitizer keeps

Everything is an allowlist. It keeps `#docs-chrome`, every menu (`.goog-menu`) with rows, and one empty `<canvas>`. It removes `svg`, `#gb`, `script`, `style`, `link`, `iframe`, `img`, `noscript` and `meta`, and keeps only the attributes `id`, `class`, `role`, `type`, `value`, `aria-label`, `aria-owns` and `aria-activedescendant`. Text is kept only inside menu rows. URLs and email addresses in what remains become `[redacted]`. Input values are cleared, except in the zoom boxes. Element IDs are kept as captured; they were not checked for document specific values, so look at them in the diff.

The capture is the only step that needs a browser session, and it is signed out. Do not paste a DOM from a signed-in session.

## Check that the harness catches a break

Do this once after setting it up, or after changing the harness:

1. In `src/constants.ts`, change `clickableZoomSelectId: "#zoomSelect"` (Docs) to `"#zoomSelectX"`.
2. `pnpm build:extended --target=chrome-mv3 && pnpm test:e2e --project extended`. The Docs preset, custom zoom and page-still-loading tests fail, because the content script no longer finds the zoom control.
3. Revert the change, rebuild, and see the tests pass.

## How it works

- `e2e/harness.ts` launches Chromium with `launchPersistentContext` and the build loaded as an extension. It aborts requests to `*.sentry.io`, and in fixture mode it serves an empty page for `docs.google.com` and aborts every other `http(s)` request (it filters on the protocol, so the extension's own files still load).
- Saved settings are written from the extension's service worker, to `chrome.storage.sync`, as the popup would.
- A recorder script in the page's main world observes events, and does not model Google: it records the text of every menu row that gets a `click`, and the value of the focused input when Enter is pressed.
- A fixture is inserted into the page 500 ms after load. The insert is a DOM mutation, which is what makes the content script start (`onElementAvailable`).
- The page-still-loading test disables the zoom control, waits, then enables it and also changes an attribute on `#docs-toolbar`. The content script only watches the toolbar element itself, not its subtree.
