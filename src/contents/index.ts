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

export const config: PlasmoCSConfig = {
  matches: ["https://docs.google.com/*"]
};

export const getStyle = () => {
  const style = document.createElement("style");
  style.textContent = styleText;
  return style;
};

const sentryClient = createSentryClient("content");

const main = () => {
  // create and "register" the relay
  relayMessage({ name: RELAY_GET_ZOOM_VALUE_FROM_STORAGE });
  relayMessage({ name: RELAY_GET_FEATURE_VIEW_ONLY_FROM_STORAGE });

  /*--EXTENDED_ONLY_START--*/
  relayMessage({ name: RELAY_EXECUTE_ENTER });
  /*--EXTENDED_ONLY_END--*/

  const currentApp = getCurrentApp();
  let strategy: DocsStrategy | SheetsStrategy;

  switch (currentApp) {
    case "Docs":
      strategy = new DocsStrategy(workspaceAppUiStrategyConfigs["Docs"]);
      break;
    case "Sheets":
      strategy = new SheetsStrategy(workspaceAppUiStrategyConfigs["Sheets"]);
      break;
  }

  if (strategy) {
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
    sentryClient.captureException(err);
  }
});
