import type { PlasmoMessaging } from "@plasmohq/messaging";
import type { ReportContentErrorRequestBody } from "src/types";
import BrowserLogger from "src/utils/logger";
import { createSentryClient } from "src/utils/sentry/base";
import { reportZoomOutcome } from "src/utils/sentry/report-zoom-outcome";
import { deserializeError } from "src/utils/serialize-error";

// The content script runs in every Docs/Sheets frame, so it leaves the Sentry client to this worker.
// The `source` tag stays "content" so events keep their origin.
const sentryScope = createSentryClient("content");
const logger = new BrowserLogger("background");

const report = (body: ReportContentErrorRequestBody, senderUrl: string | undefined) => {
  // One scope per report: tags and context of one tab must not end up on the event of another tab
  const scope = sentryScope.clone();
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

const handler: PlasmoMessaging.MessageHandler<ReportContentErrorRequestBody, object> = async (
  req,
  res
) => {
  try {
    if (req.body) {
      report(req.body, req.sender?.url);
    }
  } catch (err) {
    logger.error("Failed to report a content script error", err as Error);
  }

  res.send({});
};

export default handler;
