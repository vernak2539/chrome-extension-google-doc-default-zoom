import { relayMessage } from "@plasmohq/messaging";
import type { PlasmoCSConfig } from "plasmo";
import {
  OBSERVE_EXECUTION_LIMIT,
  RELAY_EXECUTE_ENTER,
  RELAY_GET_FEATURE_CLASSROOM_SUPPORT_FROM_STORAGE,
  RELAY_GET_FEATURE_VIEW_ONLY_FROM_STORAGE,
  RELAY_GET_ZOOM_VALUE_FROM_STORAGE,
  SELECTOR_PAGE_HEADER,
  workspaceAppUiStrategyConfigs
} from "src/constants";
import DocsStrategy from "src/strategies/docs";
import SheetsStrategy from "src/strategies/sheets";
import { isGoogleClassroomDomain } from "src/utils/classroom-helpers";
import getCurrentApp from "src/utils/get-current-app";
import BrowserLogger from "src/utils/logger";
import {
  observeElementAndExecute,
  onElementAvailable
} from "src/utils/mutation-observer-helpers";
import { createSentryClient } from "src/utils/sentry/base";
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

const sentryScope = createSentryClient("content");
const logger = new BrowserLogger("content");

const getAndStringifyContextValue = (selector: string) => {
  return JSON.stringify(walkDOM(document.querySelector(selector)), null, 2);
};

relayMessage({ name: RELAY_GET_ZOOM_VALUE_FROM_STORAGE });
relayMessage({ name: RELAY_GET_FEATURE_VIEW_ONLY_FROM_STORAGE });
relayMessage({ name: RELAY_GET_FEATURE_CLASSROOM_SUPPORT_FROM_STORAGE });

/*--EXTENDED_ONLY_START--*/
relayMessage({ name: RELAY_EXECUTE_ENTER });
/*--EXTENDED_ONLY_END--*/

const main = () => {
  // this should be first to stop execution if no current app
  const currentApp = getCurrentApp(window.location.href);
  const stop = stopExecution(currentApp);

  logger.info(`[Zoom Extension] Executing strategy for ${currentApp}`);

  if (stop) {
    logger.info(`[Zoom Extension] Stopping execution for ${currentApp}`);
    return;
  }

  // Try to place this as high up as possible
  sentryScope.setTag("application", currentApp);
  sentryScope.setContext("DOM", {
    menu: getAndStringifyContextValue(SELECTOR_PAGE_HEADER),
    body: getAndStringifyContextValue("body")
  });

  let strategy: DocsStrategy | SheetsStrategy;
  const config = workspaceAppUiStrategyConfigs[currentApp];

  switch (currentApp) {
    case "Docs":
      strategy = new DocsStrategy(workspaceAppUiStrategyConfigs["Docs"]);
      break;
    case "Sheets":
      strategy = new SheetsStrategy(workspaceAppUiStrategyConfigs["Sheets"]);
      break;
  }

  // Do not execute if there's no supported strategy or the URL indicates the "doc" being previewed
  const shouldExecute = strategy && !strategy.isUIPreview(window.location.href);
  if (!shouldExecute) {
    logger.info(
      `[Zoom Extension] Skipping execution - preview mode or unsupported strategy`
    );
    return;
  }

  const elementToWatchSelector = strategy.getIsPageLoadingElementToWatch();
  const executeStrategy = () => strategy.execute();

  try {
    const isPageLoading = strategy.getIsPageLoading();
    if (!isPageLoading) {
      logger.info(`[Zoom Extension] Page ready, executing immediately`);
      executeStrategy();
      return;
    }
    logger.info(`[Zoom Extension] Page still loading, waiting for ready state`);
  } catch (err) {
    // If we encounter an error when checking if the page is loading, we should swallow it and hope the observer works
    logger.info(`[Zoom Extension] Error checking page loading state:`, err);
    sentryScope.setExtra("inline_loading_error", err);
  }

  observeElementAndExecute(
    elementToWatchSelector,
    {
      shouldStop: (executionCount) => executionCount > OBSERVE_EXECUTION_LIMIT,
      shouldExecute: () => !strategy.getIsPageLoading()
    },
    executeStrategy
  );
};

// const isClassroomSupported = async (
//   currentApp: WorkspaceAppName
// ): Promise<boolean> => {
//   logger.info(`isClassroomSupported: ${currentApp}`);
//   const config = workspaceAppUiStrategyConfigs[currentApp];
//   const isEnabled = config.features.classroomSupport;

//   logger.info(`isEnabled: ${isEnabled}`);

//   if (!isEnabled) {
//     return false;
//   }

//   const storageKey = getFeatureClassroomSupportStorageKey(config.storageKey);
//   logger.info(`storageKey: ${storageKey}`);

//   const enabled = await getFeatureClassroomSupportFromStorage(storageKey);
//   logger.info(
//     `[Zoom Extension] Classroom support enabled for ${currentApp}: ${enabled}`
//   );
//   return enabled;
// };

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
      sentryScope.captureException(err);
    }
  });
})();
