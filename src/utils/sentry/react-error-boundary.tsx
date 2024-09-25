import * as Sentry from "@sentry/react";
import { ErrorFallback } from "src/components/ErrorFallback";
import type { ExtensionFileSource } from "src/types";
import { SENTRY_BASE_CONFIG, getDefaultTags, setLocaleOnScope } from "./config";

export const setupSentryReactErrorBoundary = (source: ExtensionFileSource) => {
  Sentry.init(SENTRY_BASE_CONFIG);
  Sentry.getCurrentScope().setTags({ source, ...getDefaultTags() });

  return (
    component: React.ComponentType<Record<string, any>>,
    fallbackHeading: string
  ) => {
    return Sentry.withErrorBoundary(component, {
      fallback: <ErrorFallback heading={fallbackHeading} />,
      beforeCapture: setLocaleOnScope
    });
  };
};
