import type { Scope } from "@sentry/react";
import packageJson from "../../../package.json";

export const SENTRY_BASE_CONFIG = {
  dsn: process.env.PLASMO_PUBLIC_SENTRY_DSN,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV || "development",
  release: packageJson.version,
  ignoreErrors: [
    /^Detached while handling command.$/,
    /^Cannot access a chrome-extension:\/\/ URL of different extension$/,
    /^Cannot access a chrome:\/\/ URL$/
  ]
};

export const getDefaultTags = () => ({
  extension: packageJson.name
});

export const setLocaleOnScope = (scope: Scope) => {
  scope.setTag("locale", chrome.i18n.getUILanguage());
};
