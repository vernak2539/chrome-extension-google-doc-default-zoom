import { relayMessage } from "@plasmohq/messaging";
import styleText from "data-text:../style.module.css";
import type { PlasmoCSConfig } from "plasmo";
import {
  OBSERVE_EXECUTION_LIMIT,
  RELAY_EXECUTE_ENTER,
  RELAY_GET_FEATURE_VIEW_ONLY_FROM_STORAGE,
  RELAY_GET_ZOOM_VALUE_FROM_STORAGE,
  workspaceAppUiStrategyConfigs
} from "src/constants";
import DocsStrategy from "src/strategies/docs";
import SheetsStrategy from "src/strategies/sheets";
import counterFactory from "src/utils/counter-factory";
import getCurrentApp from "src/utils/get-current-app";
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
    menu: JSON.stringify(
      walkDOM(document.querySelector("#docs-chrome")),
      null,
      2
    )
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
  const shouldExecute = strategy && !strategy.isPreview(window.location.href);

  if (shouldExecute) {
    const counter = counterFactory();
    const observer = new MutationObserver((_mutationList, observer) => {
      const { isLoading } = strategy.getIsPageLoading();
      const isExecutionCountOverLimit =
        counter.getCount() > OBSERVE_EXECUTION_LIMIT;

      if (isExecutionCountOverLimit) {
        observer.disconnect();
        return;
      }

      if (!isLoading) {
        observer.disconnect();
        strategy.execute("observer");
      }

      counter.increment();
    });

    // initial kick-off
    const { isLoading, getElementToWatch } = strategy.getIsPageLoading();

    if (isLoading) {
      observer.observe(getElementToWatch(), {
        attributes: true,
        childList: true
      });
    } else {
      strategy.execute("inline");
    }
  }
};

function onReady(fn) {
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    setTimeout(fn, 0);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

onReady(() => {
  try {
    main();
  } catch (err) {
    sentryScope.captureException(err);
  }
});
