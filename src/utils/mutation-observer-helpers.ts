import counterFactory from "./counter-factory";

type Callback = () => void;

interface Evaluations {
  shouldStop?: (executionCount: number) => boolean;
  shouldExecute?: () => boolean;
}

export const onElementAvailable = (
  selector: string,
  callback: Callback,
  context: Document = document
) => {
  const observer = new MutationObserver((mutations) => {
    if (context.querySelector(selector)) {
      observer.disconnect();
      callback();
    }
  });

  observer.observe(context.body, { childList: true, subtree: true });
};

export const observeElementAndExecute = (
  selector: string,
  evaluations: Evaluations,
  callback: Callback,
  maxAttempts: number = 100,
  context: Document = document
) => {
  const { shouldStop = (count) => count >= maxAttempts, shouldExecute } =
    evaluations;
  const counter = counterFactory();

  const observer = new MutationObserver((_mutationList, observer) => {
    if (shouldStop(counter.getCount())) {
      observer.disconnect();
      return;
    }

    if (shouldExecute()) {
      observer.disconnect();
      callback();
      return;
    }

    counter.increment();
  });

  const element = context.querySelector(selector);
  if (element) {
    observer.observe(element, {
      attributes: true,
      childList: true
    });
  }
};
