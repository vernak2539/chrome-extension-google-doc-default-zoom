import * as Sentry from "@sentry/react";
import type { ExtensionFileSource } from "../../types";
import { SENTRY_BASE_CONFIG, getDefaultTags } from "./config";

export const setupSentry = (source: ExtensionFileSource) => {
  Sentry.init(SENTRY_BASE_CONFIG);

  Sentry.getCurrentScope().setTags({ source, ...getDefaultTags() });

  return Sentry.ErrorBoundary;
};
