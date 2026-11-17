import type { Scope } from "@sentry/browser";
import type { ZoomOutcome } from "src/types";

// Only failed outcomes are reported, with exactly one capture. The reason is a step/selector code, never document data.
export const reportZoomOutcome = (scope: Scope, outcome: ZoomOutcome) => {
  if (outcome.status !== "failed") {
    return;
  }

  scope.setTag("zoomFailReason", outcome.reason);

  if (outcome.error !== undefined) {
    scope.captureException(outcome.error);
    return;
  }

  scope.captureMessage(`Zoom failed: ${outcome.reason}`, "warning");
};
