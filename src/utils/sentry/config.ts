import { IS_EXTENDED_EDITION } from "src/utils/edition";

import packageJson from "../../../package.json";

export const SENTRY_BASE_CONFIG = {
  dsn: process.env.PLASMO_PUBLIC_SENTRY_DSN,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV || "development",
  release: packageJson.version,
  ignoreErrors: [
    // The debugger handler only detaches once its commands have settled, so this now means someone else detached
    // (the user dismissed the debugging banner, or DevTools took over). We can't act on it, and the content script
    // falls back to a preset.
    /^Detached while handling command.$/,
    // `chrome.debugger.attach` rejects with these when the tab holds a frame the extension can't access. The content
    // script falls back to a preset, so there is nothing for us to fix.
    /^Cannot access a chrome-extension:\/\/ URL of different extension$/,
    /^Cannot access a chrome:\/\/ URL$/
  ]
};

// package.json is the same for both editions, so the Base name is spelled out here
const BASE_EXTENSION_NAME = "google-workspace-zoom-default";

export const getDefaultTags = () => ({
  extension: IS_EXTENDED_EDITION ? packageJson.name : BASE_EXTENSION_NAME
});
