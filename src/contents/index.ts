import { relayMessage } from "@plasmohq/messaging";
import styleText from "data-text:../style.module.css";
import type { PlasmoCSConfig } from "plasmo";
import { setupSentry } from "src/utils/sentry/base";
import {
  OBSERVE_EXECUTION_LIMIT,
  RELAY_EXECUTE_ENTER,
  RELAY_GET_FEATURE_VIEW_ONLY_FROM_STORAGE,
  RELAY_GET_ZOOM_VALUE_FROM_STORAGE,
  workspaceAppUiStrategyConfigs
} from "../constants";
import DocsStrategy from "../strategies/docs";
import SheetsStrategy from "../strategies/sheets";
import counterFactory from "../utils/counter-factory";
import getCurrentApp from "../utils/get-current-app";

export const config: PlasmoCSConfig = {
  matches: ["https://docs.google.com/*"]
};

export const getStyle = () => {
  const style = document.createElement("style");
  style.textContent = styleText;
  return style;
};

const sentryClient = setupSentry("content");

const main = () => {
  // create and "register" the relay
  relayMessage({ name: RELAY_GET_ZOOM_VALUE_FROM_STORAGE });
  relayMessage({ name: RELAY_EXECUTE_ENTER });
  relayMessage({ name: RELAY_GET_FEATURE_VIEW_ONLY_FROM_STORAGE });

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

try {
  main();
} catch (err) {
  sentryClient.captureException(err);
}
