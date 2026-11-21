import type { ReportContentErrorRequestBody } from "src/types";
import BrowserLogger from "src/utils/logger";
import { createSentryClient } from "src/utils/sentry/base";
import { reportZoomOutcome } from "src/utils/sentry/report-zoom-outcome";
import { deserializeError } from "src/utils/serialize-error";
import { readStoredValue, SCHEMA_VERSION_KEY } from "src/utils/storage";

// The content script runs in every Docs/Sheets frame, so it leaves the Sentry client to this worker.
// The `source` tag stays "content" so events keep their origin.
const sentryScope = createSentryClient("content");
const logger = new BrowserLogger("background");

const report = async (body: ReportContentErrorRequestBody, senderUrl: string | undefined) => {
  // One scope per report: tags and context of one tab must not end up on the event of another tab
  const scope = sentryScope.clone();
  // The client sets this tag on its own scope asynchronously, so a report that wakes the worker
  // would clone the scope before the tag exists.
  scope.setTag("storageSchemaVersion", (await readStoredValue<number>(SCHEMA_VERSION_KEY)) ?? 1);
  scope.setTag("application", body.application ?? "unknown");
  scope.setContext("DOM", body.dom);

  if (body.inlineLoadingError) {
    scope.setExtra("inline_loading_error", deserializeError(body.inlineLoadingError));
  }

  // The worker has no page of its own. `beforeSend` redacts the URL like it does for every event.
  scope.addEventProcessor((event) => {
    if (senderUrl) {
      event.request = { ...event.request, url: senderUrl };
    }
    return event;
  });

  const error = body.error && deserializeError(body.error);
  if (body.reason) {
    reportZoomOutcome(scope, { status: "failed", reason: body.reason, error });
    return;
  }

  scope.captureException(error);
};

export const reportContentError = async (
  body: ReportContentErrorRequestBody | undefined,
  senderUrl: string | undefined
): Promise<object> => {
  try {
    if (body) {
      await report(body, senderUrl);
    }
  } catch (err) {
    logger.error("Failed to report a content script error", err as Error);
  }

  return {};
};
