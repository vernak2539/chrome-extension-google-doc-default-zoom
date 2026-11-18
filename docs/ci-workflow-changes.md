# CI workflow changes for issues #101 and #104

The agent that made this change is not allowed to edit `.github/workflows/`. The maintainer must copy the YAML in this file into the repository. After that, update the table in [`releasing.md`](./releasing.md) (see [Update `releasing.md`](#update-releasingmd)).

**Apply this YAML on the branch of the pull request for issue #104, before you merge it.** That pull request removes `pnpm transform-ext` and the `build/<target>-prod` output directories. Until the three workflows below are replaced, `sanity-check.yml` and `submit.yml` fail on the missing `transform-ext` script, and the Sentry and bpp steps read paths that no longer exist. The `Sanity Check` run on the pull request itself stays red until then.

Two changes are open:

1. `sanity-check.yml` builds, checks, bundle-sizes and packages both editions with `--tag` builds (issue #104). It replaces the `transform-ext` step.
2. The two nearly identical store-submission workflows become one reusable workflow and two thin callers (issue #101). The reusable workflow takes an `edition` input (`base` or `extended`) in place of the old `transform` input.

Two other files outside this agent's reach still mention `pnpm transform-ext`: a comment in `.factory/config.yml` and the "Rules" in `.github/ISSUE_TEMPLATE/ai-task.md`. Neither runs the script, so nothing breaks. Update the wording when convenient.

Do not start the submit workflows to test the new YAML. They publish to the stores for real, and a version tag or `workflow_dispatch` starts them. To test them, open a pull request that contains the YAML, and check it with a YAML linter such as `actionlint`. Then do the first real release with care.

## `.github/workflows/sanity-check.yml` (replace the whole file)

```yaml
name: Sanity Check

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          run_install: false
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22.13.0
          cache: "pnpm"
      - name: Install dependencies
        run: pnpm install
      - name: Check formatting
        run: pnpm format:check
      - name: Lint
        run: pnpm lint
      # Vitest runs every test file once for each edition (see vite.config.ts)
      - name: Run Tests
        run: pnpm test
      - name: Build both editions
        run: |
          pnpm build:base --source-maps --target=chrome-mv3
          pnpm build:base --source-maps --target=edge-mv3
          pnpm build:base --source-maps --target=firefox-mv2
          pnpm build:extended --source-maps --target=chrome-mv3
          pnpm build:extended --source-maps --target=edge-mv3
          pnpm build:extended --source-maps --target=firefox-mv2
      - name: Check the built editions
        run: pnpm check:editions
      - name: Typecheck
        run: pnpm typecheck
      - name: Check bundle size
        run: pnpm bundlesize
        env:
          INTERNAL_SKIP_CACHE: "1"
      - name: Package extension artifacts
        run: |
          pnpm package:base --target=chrome-mv3
          pnpm package:base --target=edge-mv3
          pnpm package:base --target=firefox-mv2
          pnpm package:extended --target=chrome-mv3
          pnpm package:extended --target=edge-mv3
          pnpm package:extended --target=firefox-mv2
```

Notes on this file:

- Every edition is built from the same source, so the single `pnpm typecheck` covers both. Before this change the typecheck ran on the Extended edition only, and `pnpm bundlesize` ran twice (once per edition, after the transform).
- `bundlesize.config.json` uses `build/chrome-mv3-*`, so one `pnpm bundlesize` run measures the `chrome-mv3` build of each edition. Both builds have to exist before it runs.
- `pnpm check:editions` fails when it finds no build, so it cannot pass by checking nothing.
- `plasmo package` does not build, so each package step uses the same `--tag` as the build before it.

## Reusable submit workflow

### `.github/workflows/submit-reusable.yml` (new file)

```yaml
name: Submit to Web Store (reusable)

on:
  workflow_call:
    inputs:
      environment:
        description: "GitHub environment that holds the Sentry variables and secrets"
        type: string
        required: true
      edition:
        description: "Edition to build: base or extended"
        type: string
        required: true
      include_firefox:
        description: "Build, release, package and publish the Firefox target"
        type: boolean
        required: true
      chrome_url_prefix:
        type: string
        required: true
      edge_url_prefix:
        type: string
        required: true
      firefox_url_prefix:
        description: "Only used when include_firefox is true"
        type: string
        required: false
        default: ""
      submit_keys_secret:
        description: "Name of the secret that holds the bpp keys JSON"
        type: string
        required: true
      edition_label:
        description: "Store name that is written in the Edge notes"
        type: string
        required: true
      artifact_prefix:
        description: "Prefix of the artifact name (the version is added)"
        type: string
        required: true

jobs:
  build:
    runs-on: ubuntu-latest
    environment:
      name: ${{ inputs.environment }}
    env:
      PLASMO_PUBLIC_SENTRY_DSN: ${{ vars.PLASMO_PUBLIC_SENTRY_DSN }}
      SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
      SENTRY_ORG: ${{ vars.SENTRY_ORG }}
      SENTRY_PROJECT: ${{ vars.SENTRY_PROJECT }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          run_install: false
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22.13.0
          cache: "pnpm"
      - name: Install dependencies
        run: pnpm install
      - name: Run Tests
        run: pnpm test
      - name: Build the extension
        run: |
          pnpm build:${{ inputs.edition }} --source-maps --target=chrome-mv3
          pnpm build:${{ inputs.edition }} --source-maps --target=edge-mv3
      - name: Build the extension (Firefox)
        if: ${{ inputs.include_firefox }}
        run: pnpm build:${{ inputs.edition }} --source-maps --target=firefox-mv2
      - name: Check the built edition
        run: pnpm check:editions
      - name: get-npm-version
        id: package-version
        uses: martinbeentjes/npm-get-version-action@v1.3.1
      - name: Create Sentry release (Chrome Extension)
        uses: getsentry/action-release@v1
        with:
          environment: production
          sourcemaps: "./build/chrome-mv3-${{ inputs.edition }}"
          url_prefix: ${{ inputs.chrome_url_prefix }}
          ignore_empty: true
          ignore_missing: true
          version: ${{ steps.package-version.outputs.current-version }}
      - name: Create Sentry release (Edge Extension)
        uses: getsentry/action-release@v1
        with:
          environment: production
          sourcemaps: "./build/edge-mv3-${{ inputs.edition }}"
          url_prefix: ${{ inputs.edge_url_prefix }}
          ignore_empty: true
          ignore_missing: true
          version: ${{ steps.package-version.outputs.current-version }}
      - name: Create Sentry release (Firefox Add-on)
        if: ${{ inputs.include_firefox }}
        uses: getsentry/action-release@v1
        with:
          environment: production
          sourcemaps: "./build/firefox-mv2-${{ inputs.edition }}"
          url_prefix: ${{ inputs.firefox_url_prefix }}
          ignore_empty: true
          ignore_missing: true
          version: ${{ steps.package-version.outputs.current-version }}
      - name: Remove sourcemaps from bundle
        run: |
          rm ./build/chrome-mv3-${{ inputs.edition }}/*.map
          rm ./build/edge-mv3-${{ inputs.edition }}/*.map
      - name: Remove sourcemaps from bundle (Firefox)
        if: ${{ inputs.include_firefox }}
        run: rm ./build/firefox-mv2-${{ inputs.edition }}/*.map
      - name: Package extension artifact
        run: |
          pnpm package:${{ inputs.edition }} --target=chrome-mv3
          pnpm package:${{ inputs.edition }} --target=edge-mv3
      - name: Package extension artifact (Firefox)
        if: ${{ inputs.include_firefox }}
        run: pnpm package:${{ inputs.edition }} --target=firefox-mv2
      - name: Browser Platform Publish
        uses: PlasmoHQ/bpp@v3
        with:
          keys: ${{ secrets[inputs.submit_keys_secret] }}
          chrome-file: build/chrome-mv3-${{ inputs.edition }}.zip
          edge-file: build/edge-mv3-${{ inputs.edition }}.zip
          edge-notes: "Publishing latest '${{ inputs.edition_label }}' version (${{ steps.package-version.outputs.current-version }}) to Edge Store."
          firefox-file: ${{ inputs.include_firefox && format('build/firefox-mv2-{0}.zip', inputs.edition) || '' }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          path: build
          name: ${{ inputs.artifact_prefix }}-${{ steps.package-version.outputs.current-version }}
```

Notes on this file:

- `environment: ${{ inputs.environment }}` is set on the job in the reusable workflow. This is why the `vars.*` values and the `SENTRY_AUTH_TOKEN` secret of `build-package` and `build-package-extended` still resolve for each edition. Do not move `environment` to the caller job.
- `secrets: inherit` in the callers passes the repository and organization secrets (`SUBMIT_KEYS`, `SUBMIT_KEYS_EXTENDED`) to the reusable workflow. The environment secrets come from the job environment. `secrets[inputs.submit_keys_secret]` picks the right keys secret.
- When `include_firefox` is `false`, the `firefox-file` input is an empty string. The old Extended workflow did not pass this input at all. Check in the first real Extended run that bpp skips Firefox (the `SUBMIT_KEYS_EXTENDED` JSON has no `firefox` block).
- The step order is the same as in the old files. The Firefox steps are separate steps with `if:` guards, so the Chrome and Edge steps are identical in both editions.

### `.github/workflows/submit.yml` (replace the whole file)

```yaml
name: "(default) Submit to Web Store"
on:
  workflow_dispatch:
  push:
    tags:
      - "v[0-9]+.[0-9]+.[0-9]+"

jobs:
  submit:
    uses: ./.github/workflows/submit-reusable.yml
    secrets: inherit
    with:
      environment: build-package
      edition: base
      include_firefox: true
      chrome_url_prefix: "chrome-extension://nflkcdlimipkgbacnfnhfecjgmojhklo"
      edge_url_prefix: "chrome-extension://hnilnnalkgihkfnegpcbcgpgailgjbnn"
      firefox_url_prefix: "moz-extension://2ea8253c-b2cc-415f-8d0e-8af14a5d29fe"
      submit_keys_secret: SUBMIT_KEYS
      edition_label: "Default zoom for Google Workspace"
      artifact_prefix: google-workspace-zoom-default
```

### `.github/workflows/submit-extended.yml` (replace the whole file)

```yaml
name: "(extended) Submit to Web Store"
on:
  workflow_dispatch:
  push:
    tags:
      - "v[0-9]+.[0-9]+.[0-9]+"

jobs:
  submit:
    uses: ./.github/workflows/submit-reusable.yml
    secrets: inherit
    with:
      environment: build-package-extended
      edition: extended
      include_firefox: false
      chrome_url_prefix: "chrome-extension://mdgikencgfhineaememjagpkiclbdkka"
      edge_url_prefix: "chrome-extension://fhjmigdmbgbiodkejhmahfnaebdgnmjb"
      submit_keys_secret: SUBMIT_KEYS_EXTENDED
      edition_label: "Default zoom for Google Workspace (Extended)"
      artifact_prefix: google-workspace-zoom-extended
```

### Every difference between the two old workflows

This table was made by diffing `submit.yml` and `submit-extended.yml` at the base commit of this change. Each row shows where the reusable workflow keeps the difference.

| Item                                 | `submit.yml` (default / Base)                                                              | `submit-extended.yml` (Extended)                                                                      | Input in the new setup |
| ------------------------------------ | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | ---------------------- |
| Workflow name                        | `(default) Submit to Web Store`                                                            | `(extended) Submit to Web Store`                                                                      | `name:` in the caller  |
| Environment                          | `build-package`                                                                            | `build-package-extended`                                                                              | `environment`          |
| Edition build                        | `pnpm build:base` (was `pnpm transform-ext`, then `pnpm build`)                            | `pnpm build:extended` (was `pnpm build`)                                                              | `edition`              |
| Build targets                        | chrome-mv3, edge-mv3, firefox-mv2                                                          | chrome-mv3, edge-mv3                                                                                  | `include_firefox`      |
| Sentry release: Chrome `url_prefix`  | `chrome-extension://nflkcdlimipkgbacnfnhfecjgmojhklo`                                      | `chrome-extension://mdgikencgfhineaememjagpkiclbdkka`                                                 | `chrome_url_prefix`    |
| Sentry release: Edge `url_prefix`    | `chrome-extension://hnilnnalkgihkfnegpcbcgpgailgjbnn`                                      | `chrome-extension://fhjmigdmbgbiodkejhmahfnaebdgnmjb`                                                 | `edge_url_prefix`      |
| Sentry release: Firefox `url_prefix` | `moz-extension://2ea8253c-b2cc-415f-8d0e-8af14a5d29fe`                                     | No Firefox step                                                                                       | `firefox_url_prefix`   |
| Remove `*.map` for Firefox           | Yes                                                                                        | No                                                                                                    | `include_firefox`      |
| Package Firefox                      | Yes                                                                                        | No                                                                                                    | `include_firefox`      |
| bpp `keys` secret                    | `SUBMIT_KEYS`                                                                              | `SUBMIT_KEYS_EXTENDED`                                                                                | `submit_keys_secret`   |
| bpp `edge-notes` text                | `Publishing latest 'Default zoom for Google Workspace' version (<version>) to Edge Store.` | `Publishing latest 'Default zoom for Google Workspace (Extended)' version (<version>) to Edge Store.` | `edition_label`        |
| bpp `firefox-file`                   | `build/firefox-mv2-base.zip`                                                               | Not set                                                                                               | `include_firefox`      |
| Artifact name                        | `google-workspace-zoom-default-<version>`                                                  | `google-workspace-zoom-extended-<version>`                                                            | `artifact_prefix`      |
| Top comment                          | None                                                                                       | `#This is exactly the same as the default one minus the "Transform ..." and Sentry steps`             | Removed (see below)    |

Everything else (triggers, runner, Node version, `PLASMO_PUBLIC_SENTRY_DSN` / `SENTRY_*` `env`, test step, `get-npm-version`, Sentry `environment: production`, `ignore_empty`, `ignore_missing`, `if: always()` on the artifact upload) is identical in both old files and stays identical.

The top comment in the old `submit-extended.yml` is wrong. It says that the Extended workflow has no Sentry steps. The Extended workflow does create Sentry releases for Chrome and Edge. The new caller files do not keep this comment.

### Risks when you apply this

- A reusable-workflow call shows as `submit / build` in the Actions UI. Before you merge, look in the branch protection rules and the repository rulesets. If a rule requires a check with the old job name `build` from the submit workflows, change it. The submit workflows run only on tags and by hand, so a required check is unlikely.
- The reusable workflow must exist on the commit that the tag points to. The caller uses the local path `./.github/workflows/submit-reusable.yml`, which resolves on the same commit.
- Merging this does not start a release. Only a tag push or a manual start does.

## Update `releasing.md`

After you apply the YAML, update [`releasing.md`](./releasing.md):

- In "What the tag triggers", the table still links to `submit.yml` and `submit-extended.yml`. Those links stay valid. Add one sentence that both files call `submit-reusable.yml`, and that the per-edition values are the `with:` inputs of each caller.
- The sentence about the builds already refers to `pnpm build:base` and `pnpm build:extended`. Keep it in line with the `edition` input.
- Keep the environment and keys-secret columns. They now come from the `environment` and `submit_keys_secret` inputs.
- Delete this file (`docs/ci-workflow-changes.md`), or reduce it to a link to the final workflows, when the change is merged.
