import { relayMessage } from "@plasmohq/messaging";
import styleText from "data-text:../style.module.css";
import type { PlasmoCSConfig } from "plasmo";
import {
  OBSERVE_EXECUTION_LIMIT,
  RELAY_EXECUTE_ENTER,
  RELAY_GET_FEATURE_VIEW_ONLY_FROM_STORAGE,
  RELAY_GET_ZOOM_VALUE_FROM_STORAGE,
  SELECTOR_PAGE_HEADER,
  workspaceAppUiStrategyConfigs
} from "src/constants";
import DocsStrategy from "src/strategies/docs";
import SheetsStrategy from "src/strategies/sheets";
import getCurrentApp from "src/utils/get-current-app";
import {
  observeElementAndExecute,
  onElementAvailable
} from "src/utils/mutation-observer-helpers";
import { createSentryClient } from "src/utils/sentry/base";
import { stopExecution } from "src/utils/stop-exeuction";
import { walkDOM } from "src/utils/walk-dom";

export const config: PlasmoCSConfig = {
  matches: ["https://docs.google.com/*"]
};

export const getStyle = () => {
  const style = document.createElement("style");
  style.textContent = styleText;
  return style;
};

const sentryScope = createSentryClient("content");

const getAndStringifyContextValue = (selector: string) => {
  return JSON.stringify(walkDOM(document.querySelector(selector)), null, 2);
};

const main = () => {
  // this should be first to stop execution if no current app
  const currentApp = getCurrentApp(window.location.href);
  const stop = stopExecution(currentApp);

  if (stop) {
    return;
  }

  // Try to place this as high up as possible
  sentryScope.setTag("application", currentApp);
  sentryScope.setContext("DOM", {
    menu: getAndStringifyContextValue(SELECTOR_PAGE_HEADER),
    body: getAndStringifyContextValue("body")
  });

  // create and "register" the relay
  relayMessage({ name: RELAY_GET_ZOOM_VALUE_FROM_STORAGE });
  relayMessage({ name: RELAY_GET_FEATURE_VIEW_ONLY_FROM_STORAGE });

  /*--EXTENDED_ONLY_START--*/
  relayMessage({ name: RELAY_EXECUTE_ENTER });
  /*--EXTENDED_ONLY_END--*/

  let strategy: DocsStrategy | SheetsStrategy;

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
    return;
  }

  const elementToWatchSelector = strategy.getIsPageLoadingElementToWatch();
  const executeStrategy = () => strategy.execute();

  try {
    const isPageLoading = strategy.getIsPageLoading();

    if (!isPageLoading) {
      executeStrategy();
      return;
    }
  } catch (err) {
    // If we encounter an error when checking if the page is loading, we should swallow it and hope the observer works
    sentryScope.setExtra("inline_loading_error", err);
  }

  observeElementAndExecute(
    elementToWatchSelector,
    {
      shouldStop: (executionCount) => {
        return executionCount > OBSERVE_EXECUTION_LIMIT;
      },
      shouldExecute: () => {
        return !strategy.getIsPageLoading();
      }
    },
    executeStrategy
  );
};

// Start process when the SELECTOR_PAGE_HEADER element is available
onElementAvailable(SELECTOR_PAGE_HEADER, () => {
  try {
    main();
  } catch (err) {
    sentryScope.captureException(err);
  }
});
