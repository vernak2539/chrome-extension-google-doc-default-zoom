_copied from bootstrapping_

## Getting Started

First, run the development server:

```bash
pnpm dev        # Extended edition
pnpm dev:base   # Base edition
```

Open your browser and load the appropriate development build. The directory is named after the target and the edition. For example, if you are developing the Extended edition for the chrome browser, using manifest v3, use: `build/chrome-mv3-extended`.

You can start editing the popup by modifying `popup.tsx`. It should auto-update as you make changes. To add an options page, simply add a `options.tsx` file to the root of the project, with a react component default exported. Likewise to add a content page, add a `content.ts` file to the root of the project, importing some module and do some logic, then reload the extension on your browser.

For further guidance, [visit our Documentation](https://docs.plasmo.com/)

## Making production build

Run the following:

```bash
pnpm build:base
pnpm build:extended
pnpm check:editions
```

This creates a production bundle for each edition in `build/<target>-<edition>` (for example `build/chrome-mv3-base`), ready to be zipped (`pnpm package:base`, `pnpm package:extended`) and published to the stores. `pnpm build` and `pnpm package` are short for the Extended edition. `pnpm check:editions` fails when a built manifest or bundle does not match its edition. See "Base vs Extended Editions" in [AGENTS.md](../AGENTS.md).

## Releasing

See [releasing.md](./releasing.md).

## Development Tips

### Requesting PR Reviews from GitHub Copilot

You can request a review from GitHub Copilot using the following commands:

Using `gh pr edit`:

```bash
gh pr edit <pr-number-or-url> --add-reviewer @copilot
```

Or when creating a new PR:

```bash
gh pr create --add-reviewer @copilot
```
