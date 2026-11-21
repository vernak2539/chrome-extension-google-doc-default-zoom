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

Any tag matching `v[0-9]+.[0-9]+.[0-9]+` starts two workflows. Both can also be started by hand (`workflow_dispatch`), which publishes for real; there is no dry run.

| Workflow                                                                                           | Edition  | Stores                | Credentials secret     | Environment              |
| -------------------------------------------------------------------------------------------------- | -------- | --------------------- | ---------------------- | ------------------------ |
| [`submit.yml`](../.github/workflows/submit.yml) "(default) Submit to Web Store"                    | Base     | Chrome, Edge, Firefox | `SUBMIT_KEYS`          | `build-package`          |
| [`submit-extended.yml`](../.github/workflows/submit-extended.yml) "(extended) Submit to Web Store" | Extended | Chrome, Edge          | `SUBMIT_KEYS_EXTENDED` | `build-package-extended` |

Both files are thin callers of [`submit-reusable.yml`](../.github/workflows/submit-reusable.yml). The per-edition values in the table above (edition, Firefox on or off, environment, Sentry URL prefixes) are the `with:` inputs of each caller. Each caller passes only its own credentials secret, as `submit_keys`; the Sentry token comes from the job's environment. The workflows give `GITHUB_TOKEN` only `contents: read`.

Each run tests, builds and packages its own edition (the `edition` input: `pnpm package:base` or `pnpm package:extended`), runs `pnpm check:editions`, creates a Sentry release from the source maps in the build directories, then submits the zips with `pnpm exec wxt submit` in the "Submit to the stores" step. `wxt submit` is WXT's alias for [`publish-browser-extension`](https://github.com/aklinker1/publish-browser-extension); `bin/wxt-submit-credentials.mjs` converts the edition's JSON secret into the `CHROME_*`, `EDGE_*` and `FIREFOX_*` variables that it reads. Base builds Chrome, Edge and Firefox; Extended builds Chrome and Edge only, because Firefox has no Extended edition. `wxt.config.ts` rejects `--mode extended -b firefox`, and `submit-reusable.yml` fails if `include_firefox` is set for Extended. `wxt zip` leaves the maps in `build/<browser>-mv<n>-<edition>` and excludes them from the zip, so there is no separate strip step. The built zips are always uploaded as a run artifact (`google-workspace-zoom-default-<version>` / `google-workspace-zoom-extended-<version>`), even when publishing fails.

Follow the runs with:

```bash
gh run list -L 4
gh run watch <run-id>
```

Store review usually takes from a few hours to a few days. Firefox is often the fastest.

## When one store fails

`wxt submit` submits to each configured store in parallel and exits 1 if any of them fails. The log shows a line per store and ends with a count, e.g. `Submissions failed: 1`.

**Do not re-run the workflow** to retry one store. The stores that already accepted the version will reject the same version again, so the step fails regardless. Instead:

- If the error is about credentials (`Upload failed, double check your api credentials`, 401/403), fix the secret (see below) and upload that store's zip by hand from the run artifact.
- For any other error (e.g. Edge returning 400 on upload, often because a previous submission is still in review or a draft is stuck), sort it out in the store dashboard and upload the zip from the run artifact there.

```bash
gh run download <run-id> -D /tmp/release   # contains build/<target>-<edition>.zip
```

If every store failed, fix the cause and re-run: `gh run rerun <run-id>`.

## After the release

If an [announcement](./announcements.md) is warning users about the bug the release fixes, set its `maxVersion` to the last broken version (the one before this release) and merge to `main`, so users who have the fix stop seeing it.

## Store credentials

`SUBMIT_KEYS` and `SUBMIT_KEYS_EXTENDED` are repository secrets holding the store credentials JSON. The Extended one has no `firefox` block and uses the Extended listings' Chrome `extensionId` and Edge `productId`. The workflow passes the JSON to `bin/wxt-submit-credentials.mjs`, which writes `CHROME_*`, `EDGE_*` and `FIREFOX_*` for `wxt submit`.

Chrome Web Store API v1.1 is at end of life (Google's shutdown date is 2026-10-15). Use a service account (v2):

```json
{
  "chrome": {
    "apiVersion": "v2",
    "extensionId": "",
    "publisherId": "",
    "serviceAccountClientEmail": "",
    "serviceAccountPrivateKey": "-----BEGIN PRIVATE KEY-----\n..."
  },
  "edge": { "clientId": "", "apiKey": "", "productId": "" },
  "firefox": { "extId": "", "apiKey": "", "apiSecret": "" }
}
```

`bin/wxt-submit-credentials.mjs` is the schema source: it defines which fields are read and how `extId`/`apiKey`/`apiSecret` map to the tool's variables. `apiVersion` is optional when `serviceAccountClientEmail` is present. `serviceAccountAccessToken` can replace the email and private key, but it is short-lived. The legacy v1.1 shape (`clientId`, `clientSecret`, `refreshToken`, `extId`) is still read for older secrets, but v1.1 is at end of life; move those secrets to v2.

Secrets can't be read back from GitHub, so updating one value means setting the whole JSON again:

```bash
gh secret set SUBMIT_KEYS < keys.json
gh secret set SUBMIT_KEYS_EXTENDED < keys-extended.json
```

Check the credentials before tagging; the Edge API key expires every 72 days:

| Credential                   | Lifetime                                              | Renew                                                                                                                                                                      |
| ---------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Edge `apiKey`                | **72 days.** Expect to renew it before most releases. | Partner Center → Microsoft Edge → Publish API → create a new API key                                                                                                       |
| Chrome service account key   | No expiry unless revoked                              | Google Cloud Console → service account → Keys → create a new key; replace `serviceAccountPrivateKey`                                                                       |
| Firefox `apiKey`/`apiSecret` | No expiry unless revoked                              | addons.mozilla.org → Developer Hub → Manage API Keys                                                                                                                       |
| `SENTRY_AUTH_TOKEN`          | No expiry unless revoked                              | New Sentry auth token with `project:releases`; set it in **both** environments: `gh secret set SENTRY_AUTH_TOKEN --env build-package` (and `--env build-package-extended`) |

A failing Sentry step stops the job before anything is published.
