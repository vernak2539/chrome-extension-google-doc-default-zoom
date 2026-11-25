# Releasing

Releases are published to the stores by GitHub Actions when a version tag is pushed. There is no manual store upload in the normal flow.

## Manual check before a release

CI opens real Docs and Sheets signed out ([`e2e-live.yml`](../.github/workflows/e2e-live.yml)), but it can't sign in to Google, so it never sees Google Classroom. Check that by hand when a release changes the manifest, the content script's `matches` or `all_frames`, or anything in `src/strategies/`:

1. `pnpm build:base`, then in `chrome://extensions` turn on Developer mode and choose "Load unpacked" for `build/chrome-mv3-base`. Disable the store copy while you test.
2. In the popup, set a Docs zoom other than the default and turn on "Classroom support".
3. In Google Classroom, open a student submission (a Doc shown in the grading view) and confirm it zooms. With "Classroom support" off it must not.

## Cut a release

From an up-to-date, clean `main`:

```bash
git checkout main && git pull
npm version patch          # or minor / major
git push --follow-tags
```

`npm version` bumps `package.json`, commits it with the bare version as the message (e.g. `0.15.4`) and creates the annotated tag `v0.15.4`. `--follow-tags` pushes the commit and the tag together. Keep to this so the history stays consistent with earlier releases.

## What the tag triggers

Any tag matching `v[0-9]+.[0-9]+.[0-9]+` starts two workflows. Both can also be started by hand (`workflow_dispatch`), which publishes for real. A run checks the Chrome and Firefox credentials before it publishes, but there is no dry-run mode for the whole workflow.

| Workflow                                                                                           | Edition  | Stores                | Environment              |
| -------------------------------------------------------------------------------------------------- | -------- | --------------------- | ------------------------ |
| [`submit.yml`](../.github/workflows/submit.yml) "(default) Submit to Web Store"                    | Base     | Chrome, Edge, Firefox | `build-package`          |
| [`submit-extended.yml`](../.github/workflows/submit-extended.yml) "(extended) Submit to Web Store" | Extended | Chrome, Edge          | `build-package-extended` |

Both files are thin callers of [`submit-reusable.yml`](../.github/workflows/submit-reusable.yml). The per-edition values (edition, Firefox on or off, environment, store listing IDs, Sentry URL prefixes) are the `with:` inputs of each caller. The callers pass no secrets: the store credentials (`SUBMIT_ENV`) and the Sentry token come from the job's environment, so each edition gets its own. The workflows give `GITHUB_TOKEN` only `contents: read`.

Each run tests, builds and packages its own edition (the `edition` input: `pnpm package:base` or `pnpm package:extended`) and runs `pnpm check:editions`. Then `bin/write-submit-env.mjs` writes the environment's `SUBMIT_ENV` secret to `.env.submit`, and "Check the store credentials" runs `wxt submit --dry-run`, which signs in to the Chrome Web Store and AMO and reads the listings without uploading. Only then does the run create a Sentry release from the source maps in the build directories and submit the zips with `pnpm exec wxt submit` in the "Submit to the stores" step. `wxt submit` is WXT's alias for [`publish-browser-extension`](https://github.com/aklinker1/publish-browser-extension). Base builds Chrome, Edge and Firefox; Extended builds Chrome and Edge only, because Firefox has no Extended edition. `wxt.config.ts` rejects `--mode extended -b firefox`, and `submit-reusable.yml` fails if `include_firefox` is set for Extended. `wxt zip` leaves the maps in `build/<browser>-mv<n>-<edition>` and excludes them from the zip, so there is no separate strip step. The built zips are always uploaded as a run artifact (`google-workspace-zoom-default-<version>` / `google-workspace-zoom-extended-<version>`), even when publishing fails.

Follow the runs with:

```bash
gh run list -L 4
gh run watch <run-id>
```

Store review usually takes from a few hours to a few days. Firefox is often the fastest.

## When one store fails

`wxt submit` submits to each configured store in parallel and exits 1 if any of them fails. The log shows a line per store and ends with a count, e.g. `Submissions failed: 1`.

**Do not re-run the workflow** to retry one store. The stores that already accepted the version will reject the same version again, so the step fails regardless. Instead:

- If the error is about credentials (`Upload failed, double check your api credentials`, 401/403), fix `SUBMIT_ENV` (see below) and upload that store's zip by hand from the run artifact.
- For any other error (e.g. Edge returning 400 on upload, often because a previous submission is still in review or a draft is stuck), sort it out in the store dashboard and upload the zip from the run artifact there.

```bash
gh run download <run-id> -D /tmp/release   # contains build/<target>-<edition>.zip
```

If every store failed, fix the cause and re-run: `gh run rerun <run-id>`.

## After the release

If an [announcement](./announcements.md) is warning users about the bug the release fixes, set its `maxVersion` to the last broken version (the one before this release) and merge to `main`, so users who have the fix stop seeing it.

## Store credentials

Each environment has a `SUBMIT_ENV` secret holding that edition's credentials file, in the format `wxt submit init` writes. Keep the files locally as `.env.submit.base` and `.env.submit.extended`; `.gitignore` covers `.env*`. The run writes the secret to `.env.submit`, the only file `wxt submit` reads by itself.

Don't keep a plain `.env.submit` locally. Without one, a bare `wxt submit` has no credentials and fails its config check instead of publishing. `pnpm exec wxt submit init` walks through every store and writes `.env.submit`: rename it to `.env.submit.<edition>` afterwards.

| Environment              | File (local)           | `CHROME_EXTENSION_ID`              | `EDGE_PRODUCT_ID`                      | `FIREFOX_*`                                                                   |
| ------------------------ | ---------------------- | ---------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------- |
| `build-package`          | `.env.submit.base`     | `nflkcdlimipkgbacnfnhfecjgmojhklo` | `f8b7c29f-87dc-41de-8e27-ee45f0f3715c` | Required; `FIREFOX_EXTENSION_ID=google-workspace-zoom-default@vernacchia.dev` |
| `build-package-extended` | `.env.submit.extended` | `mdgikencgfhineaememjagpkiclbdkka` | `237141ed-f089-4011-a4d4-ac0811df79ef` | Not used                                                                      |

`bin/write-submit-env.mjs` fails the run if these IDs don't match the listings the workflow submits that edition to, so one edition's file can't publish to the other's listings. The workflow inputs `chrome_extension_id`, `edge_product_id` and `firefox_extension_id` hold the expected IDs. Both editions belong to the same Chrome Web Store publisher and Partner Center account, so the two files share their credentials; a publisher can link only one service account.

Chrome Web Store API v1.1 is at end of life (Google's shutdown date is 2026-10-15). Use a service account (v2): `CHROME_API_VERSION=v2`, `CHROME_PUBLISHER_ID`, `CHROME_SERVICE_ACCOUNT_CLIENT_EMAIL` and `CHROME_SERVICE_ACCOUNT_PRIVATE_KEY`. The service account's email must be added in the Chrome Web Store Developer Dashboard under **Account**; until it is, the credentials check fails with `403 PERMISSION_DENIED` on `publishers/<id>/items/<id>`.

Secrets can't be read back from GitHub, so updating one value means setting the whole file again:

```bash
gh secret set SUBMIT_ENV --env build-package < .env.submit.base
gh secret set SUBMIT_ENV --env build-package-extended < .env.submit.extended
```

Check the credentials locally before tagging. `--dry-run` signs in to the Chrome Web Store and AMO and reads the listings without uploading; it does not check Edge. It needs the zips. `node --env-file` loads the edition's file with the same parser `wxt submit` uses:

```bash
pnpm package:base -b chrome && pnpm package:base -b edge && pnpm package:base -b firefox
node --env-file=.env.submit.base node_modules/wxt/bin/wxt.mjs submit --dry-run \
  --chrome-zip build/chrome-mv3-base.zip --edge-zip build/edge-mv3-base.zip --firefox-zip build/firefox-mv2-base.zip

pnpm package:extended -b chrome && pnpm package:extended -b edge
node --env-file=.env.submit.extended node_modules/wxt/bin/wxt.mjs submit --dry-run \
  --chrome-zip build/chrome-mv3-extended.zip --edge-zip build/edge-mv3-extended.zip
```

The Edge API key expires every 72 days:

| Credential                                  | Lifetime                                              | Renew                                                                                                                                                                      |
| ------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EDGE_API_KEY`                              | **72 days.** Expect to renew it before most releases. | Partner Center → Microsoft Edge → Publish API → create a new API key                                                                                                       |
| `CHROME_SERVICE_ACCOUNT_PRIVATE_KEY`        | No expiry unless revoked                              | Google Cloud Console → service account → Keys → create a new key                                                                                                           |
| `FIREFOX_JWT_ISSUER` / `FIREFOX_JWT_SECRET` | No expiry unless revoked                              | addons.mozilla.org → Developer Hub → Manage API Keys                                                                                                                       |
| `SENTRY_AUTH_TOKEN`                         | No expiry unless revoked                              | New Sentry auth token with `project:releases`; set it in **both** environments: `gh secret set SENTRY_AUTH_TOKEN --env build-package` (and `--env build-package-extended`) |

A failing credentials check or Sentry step stops the job before anything is published.
