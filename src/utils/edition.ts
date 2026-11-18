// Plasmo sets PLASMO_TAG from `--tag=<edition>`, and Vitest sets it per project (see vite.config.ts).
// An unset tag means Base, so a build or test without a tag can never include the debugger code.
export const IS_EXTENDED_EDITION = process.env.PLASMO_TAG === "extended";
