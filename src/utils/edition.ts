// The WXT build mode is the edition (`--mode base|extended`), and Vitest sets it per project (see vite.config.ts).
// Any other mode builds Base, so a build or test without a mode can never include the debugger code.
export const IS_EXTENDED_EDITION = import.meta.env.MODE === "extended";
