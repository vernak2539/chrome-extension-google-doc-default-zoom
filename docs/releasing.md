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

| Workflow                                                                                           | Edition  | Stores                | Store keys secret      | Environment              |
| -------------------------------------------------------------------------------------------------- | -------- | --------------------- | ---------------------- | ------------------------ |
| [`submit.yml`](../.github/workflows/submit.yml) "(default) Submit to Web Store"                    | Base     | Chrome, Edge, Firefox | `SUBMIT_KEYS`          | `build-package`          |
| [`submit-extended.yml`](../.github/workflows/submit-extended.yml) "(extended) Submit to Web Store" | Extended | Chrome, Edge          | `SUBMIT_KEYS_EXTENDED` | `build-package-extended` |

Both files are thin callers of [`submit-reusable.yml`](../.github/workflows/submit-reusable.yml). The per-edition values in the table above (edition, Firefox on or off, environment, Sentry URL prefixes) are the `with:` inputs of each caller. Each caller passes only its own store keys secret, as `submit_keys`; the Sentry token comes from the job's environment. The workflows give `GITHUB_TOKEN` only `contents: read`.

Each run tests, builds its own edition (the `edition` input: `pnpm build:base` or `pnpm build:extended`), runs `pnpm check:editions`, creates a Sentry release with source maps, strips the maps, packages, then hands the zips to [`PlasmoHQ/bpp`](https://github.com/PlasmoHQ/bpp) in the "Browser Platform Publish" step. The built zips are always uploaded as a run artifact (`google-workspace-zoom-default-<version>` / `google-workspace-zoom-extended-<version>`), even when publishing fails.

Follow the runs with:

```bash
gh run list -L 4
gh run watch <run-id>
```

Store review usually takes from a few hours to a few days. Firefox is often the fastest.

## When one store fails

bpp submits to each store independently and fails the step if any of them fails. The log shows a line per store, e.g.:

```
Successfully updated "nflkcdlimipkgbacnfnhfecjgmojhklo" (...) to version 0.15.4 on Chrome Web Store!
🔴 ERROR  | Error: edge: ... Response code 400 (Bad Request)
```

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

`SUBMIT_KEYS` and `SUBMIT_KEYS_EXTENDED` are repository secrets holding the bpp keys JSON. The Extended one has no `firefox` block and uses the Extended listings' Chrome `extId` and Edge `productId`.

```json
{
  "$schema": "https://raw.githubusercontent.com/plasmo-corp/bpp/v3/keys.schema.json",
  "chrome": { "clientId": "", "clientSecret": "", "refreshToken": "", "extId": "" },
  "edge": { "clientId": "", "apiKey": "", "productId": "" },
  "firefox": { "extId": "", "apiKey": "", "apiSecret": "" }
}
```

Secrets can't be read back from GitHub, so updating one value means setting the whole JSON again:

```bash
gh secret set SUBMIT_KEYS < keys.json
gh secret set SUBMIT_KEYS_EXTENDED < keys-extended.json
```

Several credentials expire, and releases are infrequent, so check them before tagging:

| Credential                   | Lifetime                                                                                   | Renew                                                                                                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Edge `apiKey`                | **72 days.** Expect to renew it before most releases.                                      | Partner Center → Microsoft Edge → Publish API → create a new API key                                                                                                       |
| Chrome `refreshToken`        | Revoked after 6 months unused, or after 7 days if the OAuth consent screen is in "Testing" | Keep the consent screen "In production" in Google Cloud Console, then generate a new token (e.g. `npx chrome-webstore-upload-keys`)                                        |
| Firefox `apiKey`/`apiSecret` | No expiry unless revoked                                                                   | addons.mozilla.org → Developer Hub → Manage API Keys                                                                                                                       |
| `SENTRY_AUTH_TOKEN`          | No expiry unless revoked                                                                   | New Sentry auth token with `project:releases`; set it in **both** environments: `gh secret set SENTRY_AUTH_TOKEN --env build-package` (and `--env build-package-extended`) |

A failing Sentry step stops the job before anything is published.
