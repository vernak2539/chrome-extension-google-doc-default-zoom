import * as Sentry from "@sentry/browser";
import type { ExtensionFileSource } from "../../types";
import { getDefaultTags, sentryConfig } from "./config";

export const setupSentry = (source: ExtensionFileSource) => {
  Sentry.init(sentryConfig);

  Sentry.configureScope((scope) => {
    scope.setTags({ source, ...getDefaultTags() });
  });

  return Sentry.wrap;
};
