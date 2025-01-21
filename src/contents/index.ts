import { relayMessage } from "@plasmohq/messaging";
import type { PlasmoCSConfig } from "plasmo";
import {
  getFeatureClassroomSupportStorageKey,
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
import type { WorkspaceAppName } from "src/types";
import { isGoogleClassroomDomain } from "src/utils/classroom-helpers";
import getCurrentApp from "src/utils/get-current-app";
import { getFeatureClassroomSupportFromStorage } from "src/utils/get-feature-classroom-support-from-storage";
import BrowserLogger from "src/utils/logger";
import { observeElementAndExecute } from "src/utils/mutation-observer-helpers";
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

const executeStrategy = (currentApp: WorkspaceAppName) => {
  logger.info(`[Zoom Extension] Executing strategy for ${currentApp}`);
  const stop = stopExecution(currentApp);
  if (stop) {
    logger.info(`[Zoom Extension] Stopping execution for ${currentApp}`);
    return;
  }

  sentryScope.setTag("application", currentApp);
  sentryScope.setContext("DOM", {
    menu: getAndStringifyContextValue(SELECTOR_PAGE_HEADER),
    body: getAndStringifyContextValue("body")
  });

  let strategy: DocsStrategy | SheetsStrategy;
  const config = workspaceAppUiStrategyConfigs[currentApp];

  if (currentApp === "Docs") {
    strategy = new DocsStrategy(config);
  } else if (currentApp === "Sheets") {
    strategy = new SheetsStrategy(config);
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
  const executeStrategyFn = () => {
    logger.info(`[Zoom Extension] Running strategy execution`);
    strategy.execute();
  };

  try {
    const isPageLoading = strategy.getIsPageLoading();
    if (!isPageLoading) {
      logger.info(`[Zoom Extension] Page ready, executing immediately`);
      executeStrategyFn();
      return;
    }
    logger.info(`[Zoom Extension] Page still loading, waiting for ready state`);
  } catch (err) {
    logger.info(`[Zoom Extension] Error checking page loading state:`, err);
    sentryScope.setExtra("inline_loading_error", err);
  }

  observeElementAndExecute(
    elementToWatchSelector,
    {
      shouldStop: (executionCount) => executionCount > OBSERVE_EXECUTION_LIMIT,
      shouldExecute: () => !strategy.getIsPageLoading()
    },
    executeStrategyFn,
    OBSERVE_EXECUTION_LIMIT
  );
};

const waitForElement = (selector: string): Promise<Element> => {
  return new Promise((resolve, reject) => {
    const maxAttempts = 50; // 5 seconds total
    let attempts = 0;

    const checkElement = () => {
      attempts++;
      logger.info(
        `[Zoom Extension] Attempt ${attempts} to find element ${selector}`
      );

      const element = document.querySelector(selector);
      if (element) {
        logger.info(
          `[Zoom Extension] Successfully found element ${selector} on attempt ${attempts}`
        );
        resolve(element);
        return;
      }

      if (attempts >= maxAttempts) {
        reject(
          new Error(
            `Element ${selector} not found after ${maxAttempts} attempts`
          )
        );
        return;
      }

      setTimeout(checkElement, 100);
    };

    checkElement();
  });
};

const main = async () => {
  logger.info(
    `[Zoom Extension] Starting main execution in ${window.location.href}`
  );

  const currentApp = getCurrentApp(window.location.href);

  if (currentApp) {
    logger.info(
      `[Zoom Extension] Detected app type: ${currentApp}, waiting for page header`
    );
    try {
      await waitForElement(SELECTOR_PAGE_HEADER);
      logger.info(
        `[Zoom Extension] Page header available, proceeding with strategy`
      );
      executeStrategy(currentApp);
    } catch (err) {
      logger.info(`[Zoom Extension] Failed to find page header:`, err);
      sentryScope.captureException(err);
    }
  } else {
    logger.info(
      `[Zoom Extension] No supported app type detected for URL: ${window.location.href}`
    );
  }
};

const isClassroomSupported = async (
  currentApp: WorkspaceAppName
): Promise<boolean> => {
  logger.info(`isClassroomSupported: ${currentApp}`);
  const config = workspaceAppUiStrategyConfigs[currentApp];
  const isEnabled = config.features.classroomSupport;

  logger.info(`isEnabled: ${isEnabled}`);

  if (!isEnabled) {
    return false;
  }

  const storageKey = getFeatureClassroomSupportStorageKey(config.storageKey);
  logger.info(`storageKey: ${storageKey}`);

  const enabled = await getFeatureClassroomSupportFromStorage(storageKey);
  logger.info(
    `[Zoom Extension] Classroom support enabled for ${currentApp}: ${enabled}`
  );
  return enabled;
};

(async () => {
  if (isGoogleClassroomDomain()) {
    logger.info(`[Zoom Extension] Skipping execution in classroom main page`);
    return;
  }

  try {
    // Check if we're in classroom context
    const isClassroom = window.location.hostname === "classroom.google.com";

    // Skip execution in main classroom page
    if (isClassroom && window === window.top) {
      logger.info(`[Zoom Extension] Skipping execution in classroom main page`);
      return;
    }

    // If we're in a classroom iframe, check if the feature is supported
    if (isClassroom || window.location.href.includes("/grading")) {
      const currentApp = getCurrentApp(window.location.href);
      const allowOnClassroom = await isClassroomSupported(currentApp);
      if (!currentApp || !allowOnClassroom) {
        logger.info(
          `[Zoom Extension] Classroom support not enabled for ${currentApp}`
        );
        return;
      }
      logger.info(
        `[Zoom Extension] Classroom support enabled for ${currentApp}`
      );
    }

    logger.info(`[Zoom Extension] Extension activated`);
    await main();
  } catch (err) {
    console.error(`[Zoom Extension] Fatal error:`, err);
    sentryScope.captureException(err);
  }
})();
