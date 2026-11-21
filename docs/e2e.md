# Browser tests against Docs and Sheets markup (`e2e/`)

The unit tests fake the DOM the zoom flow drives. These tests load the **built extension** in headless Chromium and check what the content script does to Google-shaped pages: which menu row it clicks, and what the Extended edition types into the zoom box.

There are two modes:

| Mode         | Command                      | Pages                                                                                                    | Runs                                            |
| ------------ | ---------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| **Fixture**  | `pnpm test:e2e`              | Saved markup in [`e2e/fixtures/`](../e2e/fixtures), served as `docs.google.com`. No network.             | Every pull request (`sanity-check.yml`)         |
| **Live**     | `pnpm test:e2e:live`         | The maintainer's public Doc and Sheet, **signed out**. The harness never signs in to Google.             | Every pull request and by hand (`e2e-live.yml`) |
| Firefox      | `pnpm test:e2e:firefox`      | The same saved markup, in Firefox stable with `build/firefox-mv2-base`. See [Firefox](#firefox).         | Every pull request (`sanity-check.yml`)         |
| Firefox live | `pnpm test:e2e:live:firefox` | The same public Doc and Sheet as live mode, signed out, in Firefox stable with `build/firefox-mv2-base`. | Every pull request and by hand (`e2e-live.yml`) |
| Capture      | `pnpm e2e:capture`           | Opens the same public pages signed out, saves them, and sanitizes them into `e2e/fixtures/`.             | By hand, or in `e2e-live.yml`                   |

The fixture tests cover a preset zoom (Docs and Sheets), a custom zoom (Extended only), the Docs view-only flow, a page that is still loading, and a zoom picked in the popup and then changed. Every browser test runs once per edition, like `pnpm test`: `e2e/vitest.config.ts` has a `base` and an `extended` project, each loading `build/chrome-mv3-<edition>`. In the Base edition the custom-zoom test is replaced by one that checks nothing is clicked or typed.

The browser tests are named `*.e2e.ts` and use their own config (`e2e/vitest.config.ts`), so `pnpm test` does not collect them. `e2e/fixture-sanitize.test.ts` is a normal unit test and runs with `pnpm test`.

## Run it locally

```bash
pnpm install
pnpm exec playwright install --with-deps chromium   # once
pnpm build:base -b chrome                  # without WXT_SENTRY_DSN set
pnpm build:extended -b chrome
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

Set `E2E_LIVE_DOC_URL` and `E2E_LIVE_SHEET_URL` to use other public documents. If a page is blocked or has no zoom control, the failure message says where the page went (a Google sign-in page means the document is not shared publicly) and lists the selectors that were found (`#docs-chrome`, `#zoomSelect`, `#t-zoom`, `#docs-view-menu`, ...).

## Firefox

`sanity-check.yml` installs Mozilla's Firefox stable with `@puppeteer/browsers` and runs `pnpm test:e2e:firefox` against `build/firefox-mv2-base`. `e2e-live.yml` does the same and runs `pnpm test:e2e:live:firefox`. Firefox ships only the Base edition, so there is no Extended run.

Playwright can't load an extension into Firefox, so [`e2e/firefox-harness.ts`](../e2e/firefox-harness.ts) drives Firefox with Puppeteer over WebDriver BiDi instead of using `e2e/harness.ts`. Two files use it:

- [`e2e/firefox.e2e.ts`](../e2e/firefox.e2e.ts) repeats the Base fixture tests except the popup round trip. When you change a fixture test in `e2e/zoom-fixtures.e2e.ts`, change it there too.
- [`e2e/firefox-live.e2e.ts`](../e2e/firefox-live.e2e.ts) repeats the live tests in `e2e/zoom-live.e2e.ts`, against the same documents (`E2E_LIVE_DOC_URL` and `E2E_LIVE_SHEET_URL` apply). It checks that the extension works on the markup Google sends to Firefox, which the fixtures (captured in Chromium) can't show.

What differs from Chromium:

- Settings are written from the popup page. Firefox MV2 has a background page instead of a service worker, and Puppeteer doesn't expose it.
- The `extensions.webextensions.uuids` pref pins the extension's `moz-extension://` host, which is otherwise random per profile.
- Firefox starts with `MOZ_REMOTE_ALLOW_SYSTEM_ACCESS=1`. Without it WebDriver BiDi doesn't open `moz-extension://` pages.
- Requests from the background page can't be routed, so the check for a Sentry DSN in the build is the only guard for them. The live pages abort requests to `*.sentry.io` and let everything else through.

To run it on Linux:

```bash
pnpm build:base -b firefox   # without WXT_SENTRY_DSN set
export FIREFOX_BIN="$(pnpm exec browsers install firefox@stable --path e2e/results/browsers --format '{{path}}')"
pnpm test:e2e:firefox
pnpm test:e2e:live:firefox             # the live pages; needs the network
```

Screenshots of failed tests go to `e2e/results/screenshots/firefox-<test>.png` (`firefox-live-docs.png` and `firefox-live-sheets.png` for the live tests).

## Capture and refresh the fixtures

The fixtures that ship with this change are **synthetic**: written from the selectors in `src/constants.ts` and the strategies, with a header saying so. A fixture only protects against Google changing its markup once it is captured from the real page, so replace them.

1. `pnpm exec playwright install --with-deps chromium` (once).
2. `pnpm e2e:capture`. This opens the public Doc and Sheet signed out, waits for the zoom control to be enabled, opens the zoom menu (View > Zoom for the view-only fixture), and saves the raw page to `e2e/results/raw/` (gitignored, never uploaded). It then sanitizes each page into `e2e/fixtures/<name>.html`.
3. Review `git diff e2e/fixtures`. Look for anything that is not UI markup.
4. `pnpm exec vitest run e2e/fixture-sanitize.test.ts` (checks that each fixture has what the extension needs and no leaks).
5. Commit `e2e/fixtures/`.

Instead of steps 1 and 2, you can download the `fixtures` artifact of a run of the `E2E live` workflow ([`.github/workflows/e2e-live.yml`](../.github/workflows/e2e-live.yml), on a pull request or started by hand from the Actions tab), copy its files into `e2e/fixtures/`, and continue at step 3.

Capture fails, and writes nothing, when:

- the zoom control or the View menu never becomes enabled (the message says where the page went and names the selectors that were found). For the editor fixtures the public Doc and Sheet have to allow editing signed out. A view-only page has no `#zoomSelect` or `#t-zoom`;
- the View menu has no Zoom item. Only a Doc that can't be edited has View > Zoom, so `docs-view-only` needs its own Doc shared as Viewer (`E2E_LIVE_VIEW_ONLY_DOC_URL`);
- a required selector is missing after sanitizing;
- the sanitized markup still holds a script, iframe, svg, `on*` attribute, URL or email address.

A failing target does not stop the others: `pnpm e2e:capture` always runs the sanitize step, which skips a target that has no raw file (its fixture keeps its previous content), and then exits non-zero if any capture failed. The Docs fixtures need two Docs: `docs-editor` one that can be edited signed out (`E2E_LIVE_DOC_URL`), and `docs-view-only` one shared as Viewer (`E2E_LIVE_VIEW_ONLY_DOC_URL`).

### What the sanitizer keeps

Everything is an allowlist. It keeps `#docs-chrome`, every menu (`.goog-menu`) with rows, and one empty `<canvas>`. It removes `svg`, `#gb`, `script`, `style`, `link`, `iframe`, `img`, `noscript`, `meta` and the `docs-presence` widgets (the people in the document), and keeps only the attributes `id`, `class`, `role`, `type`, `value`, `aria-label`, `aria-owns` and `aria-activedescendant`. Text is kept only inside menu rows. URLs and email addresses in what remains become `[redacted]`. Input values and labels are cleared, except in the zoom boxes (Docs labels the title box with the document title). Element IDs are kept as captured; they were not checked for document specific values, so look at them in the diff.

The capture is the only step that needs a browser session, and it is signed out. Do not paste a DOM from a signed-in session.

## Check that the harness catches a break

Do this once after setting it up, or after changing the harness:

1. In `src/constants.ts`, change `clickableZoomSelectId: "#zoomSelect"` (Docs) to `"#zoomSelectX"`.
2. `pnpm build:extended -b chrome && pnpm test:e2e --project extended`. The Docs preset, custom zoom, page-still-loading and popup tests fail, because the content script no longer finds the zoom control.
3. Revert the change, rebuild, and see the tests pass.

To check the popup side, make the `onChange` of the dropdown in `src/components/SelectZoomInput/index.tsx` do nothing instead. The popup test then times out waiting for a storage write.

## How it works

- `e2e/harness.ts` launches Chromium with `launchPersistentContext` and the build loaded as an extension. It aborts requests to `*.sentry.io`, and in fixture mode it serves an empty page for `docs.google.com` and aborts every other `http(s)` request (it filters on the protocol, so the extension's own files still load).
- Most tests write saved settings from the extension's service worker, to `chrome.storage.sync`, as the popup would. Values are plain (`schemaVersion: 2`), the format the current build writes.
- One test seeds the format the Plasmo versions wrote (`JSON.stringify(state)` and `schemaVersion: "2"`) and checks that the new build migrates it and still applies the saved zoom. That is the upgrade path users get when they update.
- The popup test saves them through the popup instead. It opens `popup.html` as a tab, picks a zoom in the Docs dropdown, and checks that the Docs page applies it. Then it picks another and checks the reloaded page applies that one.
  - `installStorageRecorder` wraps the `chrome.storage` write calls on extension pages. The test uses it to check that opening the popup writes nothing, and that each pick writes the whole Docs state once.
  - It counts calls rather than `chrome.storage.onChanged` events, because Chrome sends no event when a value is rewritten unchanged.
- A recorder script in the page's main world observes events, and does not model Google: it records the text of every menu row that gets a `click`, the value of the focused input when Enter is pressed, and the target of every `mousedown` outside the zoom control and its menu (the outside press that closes a menu the flow opened without focusing the input).
- A fixture is inserted into the page 500 ms after load. The insert is a DOM mutation, which is what makes the content script start (`onElementAvailable`).
- The page-still-loading test disables the zoom control, waits, then enables it by removing the disabled class from the zoom control only. The content script watches `#docs-toolbar` including its subtree, so that class change on a descendant is enough to start the zoom.
