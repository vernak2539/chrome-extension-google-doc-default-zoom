import { IS_EXTENDED_EDITION } from "src/utils/edition";

export const SENTRY_BASE_CONFIG = {
  dsn: import.meta.env.WXT_SENTRY_DSN,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
  environment: import.meta.env.COMMAND === "build" ? "production" : "development",
  // The release is set in `createSentryClient`: importing package.json here put all of it, devDependencies
  // included, into every bundle.
  ignoreErrors: [
    // Chrome's LevelDB store behind `chrome.storage` is corrupt or locked in the user's profile (for example
    // `MANIFEST-000001: Unable to create sequential file` or `LOCK: Access denied`). The background falls back to
    // the default state, and every page load on that profile would send another event.
    /^IO error: .*\(ChromeMethodBFE: \d+::\w+::\d+\)$/,
    // The host has no sync storage (Electron). It isn't a supported browser, and the background falls back to the
    // default state. The first message comes from the browser API, the second from WXT's storage area lookup.
    /^"sync" is not available in this instance of Chrome$/,
    /^"browser\.storage\.sync" is undefined$/
  ]
};

export const getDefaultTags = () => ({
  extension: IS_EXTENDED_EDITION
    ? "google-workspace-zoom-extended"
    : "google-workspace-zoom-default"
});
