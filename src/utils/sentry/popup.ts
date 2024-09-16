import * as Sentry from "@sentry/react";
import type { ExtensionFileSource } from "../../types";
import { getDefaultTags, sentryConfig } from "./config";

export const setupSentry = (source: ExtensionFileSource) => {
  Sentry.init(sentryConfig);

  Sentry.getCurrentScope().setTags({ source, ...getDefaultTags() });

  return Sentry.ErrorBoundary;
};
