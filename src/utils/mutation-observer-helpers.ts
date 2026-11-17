import type { ZoomFailReason } from "../types";
import counterFactory from "./counter-factory";

type Callback = () => void;

type OnStop = (
  reason: Extract<ZoomFailReason, "watch_element_missing" | "page_load_timeout">
) => void;

interface Evaluations {
  shouldStop?: (executionCount: number) => boolean;
  shouldExecute?: () => boolean;
}

export const onElementAvailable = (selector: string, callback: Callback) => {
  const observer = new MutationObserver((mutations) => {
    if (document.querySelector(selector)) {
      observer.disconnect();
      callback();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
};

export const observeElementAndExecute = (
  selector: string,
  evaluations: Evaluations,
  callback: Callback,
  onStop?: OnStop
) => {
  const { shouldStop, shouldExecute } = evaluations;
  const counter = counterFactory();

  const observer = new MutationObserver((_mutationList, observer) => {
    if (shouldStop?.(counter.getCount())) {
      observer.disconnect();
      onStop?.("page_load_timeout");
      return;
    }

    if (shouldExecute?.()) {
      observer.disconnect();
      callback();
      return;
    }

    counter.increment();
  });

  const element = document.querySelector(selector);

  if (!element) {
    onStop?.("watch_element_missing");
    return;
  }

  observer.observe(element, {
    attributes: true,
    childList: true
  });
};
