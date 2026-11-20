import { relayMessage, sendToBackground } from "@plasmohq/messaging";
import type { PlasmoCSConfig } from "plasmo";
import {
  OBSERVE_EXECUTION_LIMIT,
  RELAY_EXECUTE_ENTER,
  RELAY_GET_APP_STORAGE_STATE,
  RELAY_REPORT_CONTENT_ERROR,
  SELECTOR_PAGE_HEADER,
  workspaceAppUiStrategyConfigs
} from "src/constants";
import { AbstractBaseStrategy } from "src/strategies/base";
import DocsStrategy from "src/strategies/docs";
import SheetsStrategy from "src/strategies/sheets";
import type {
  ReportContentErrorRequestBody,
  WorkspaceAppName,
  ZoomFailReason,
  ZoomOutcome
} from "src/types";
import { isGoogleClassroomDomain } from "src/utils/classroom-helpers";
import { IS_EXTENDED_EDITION } from "src/utils/edition";
import getCurrentApp from "src/utils/get-current-app";
import BrowserLogger from "src/utils/logger";
import { observeElementAndExecute, onElementAvailable } from "src/utils/mutation-observer-helpers";
import { serializeError } from "src/utils/serialize-error";
import { stopExecution } from "src/utils/stop-exeuction";
import { walkDOM } from "src/utils/walk-dom";

export const config: PlasmoCSConfig = {
  matches: [
    "https://docs.google.com/document/*",
    "https://docs.google.com/spreadsheets/*",
    "https://classroom.google.com/*"
  ],
  exclude_matches: ["https://docs.google.com/offline/*"],
  all_frames: true
};

const logger = new BrowserLogger("content");

let currentApp: WorkspaceAppName | null = null;
let inlineLoadingError: unknown;

const getAndStringifyContextValue = (selector: string) => {
  return JSON.stringify(walkDOM(document.querySelector(selector)), null, 2);
};

// Sentry lives in the background worker: this script is injected into every matching frame and should
// stay small. The page structure is only walked here, when there is a failure to explain.
const reportFailure = (reason: ZoomFailReason | undefined, error?: unknown) => {
  try {
    const body: ReportContentErrorRequestBody = {
      application: currentApp,
      reason,
      error: error === undefined ? undefined : serializeError(error),
      inlineLoadingError:
        inlineLoadingError === undefined ? undefined : serializeError(inlineLoadingError),
      dom: {
        menu: getAndStringifyContextValue(SELECTOR_PAGE_HEADER),
        body: getAndStringifyContextValue("body")
      }
    };

    sendToBackground({ name: RELAY_REPORT_CONTENT_ERROR, body }).catch((sendError) =>
      logger.error("Could not send the error report to the background", sendError)
    );
  } catch (reportError) {
    logger.error("Could not build the error report", reportError as Error);
  }
};

const handleOutcome = (outcome: ZoomOutcome) => {
  const reason = outcome.status === "applied" ? "" : ` (${outcome.reason})`;
  logger.info(`Zoom outcome: ${outcome.status}${reason}`);

  if (outcome.status === "failed") {
    reportFailure(outcome.reason, outcome.error);
  }
};

const createStrategy = (currentApp: WorkspaceAppName | null): AbstractBaseStrategy | undefined => {
  switch (currentApp) {
    case "Docs":
      return new DocsStrategy(workspaceAppUiStrategyConfigs["Docs"]);
    case "Sheets":
      return new SheetsStrategy(workspaceAppUiStrategyConfigs["Sheets"]);
  }
};

relayMessage({ name: RELAY_GET_APP_STORAGE_STATE });

if (IS_EXTENDED_EDITION) {
  relayMessage({ name: RELAY_EXECUTE_ENTER });
}

const main = () => {
  // this should be first to stop execution if no current app
  currentApp = getCurrentApp(window.location.href);
  const stop = stopExecution(currentApp);

  logger.addContext("application", String(currentApp));
  logger.info("Executing...");

  if (stop) {
    logger.info("Stopping execution - unsupported application");
    return;
  }

  const strategy = createStrategy(currentApp);

  // Do not execute if there's no supported strategy or the URL indicates the "doc" being previewed
  if (!strategy || strategy.isUIPreview(window.location.href)) {
    logger.info(`Skipping execution - preview mode or unsupported strategy`);
    return;
  }

  const elementToWatchSelector = strategy.getIsPageLoadingElementToWatch();
  const executeStrategy = () => {
    // execute() never rejects: every failure comes back as an outcome
    strategy.execute().then(handleOutcome);
  };

  try {
    const isPageLoading = strategy.getIsPageLoading();
    if (!isPageLoading) {
      logger.info("Page ready, executing immediately");
      executeStrategy();
      return;
    }
    logger.info("Page still loading, waiting for ready state");
  } catch (err) {
    // If we encounter an error when checking if the page is loading, we should swallow it and hope the observer works
    logger.error(`Error checking page loading state:`, err);
    inlineLoadingError = err;
  }

  observeElementAndExecute(
    elementToWatchSelector,
    {
      shouldStop: (executionCount) => executionCount > OBSERVE_EXECUTION_LIMIT,
      shouldExecute: () => !strategy.getIsPageLoading()
    },
    executeStrategy,
    (reason) => handleOutcome({ status: "failed", reason })
  );
};

(() => {
  logger.addContext("url", window.location.href);

  if (isGoogleClassroomDomain()) {
    logger.info("Skipping execution in Google Classroom TLD");
    return;
  }

  // Start process when the SELECTOR_PAGE_HEADER element is available
  onElementAvailable(SELECTOR_PAGE_HEADER, () => {
    try {
      main();
    } catch (err) {
      reportFailure(undefined, err);
    }
  });
})();
