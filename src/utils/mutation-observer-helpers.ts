import counterFactory from "./counter-factory";

type Callback = () => void;

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

export const onMutationObserverCondition = (
  selector: string,
  evaluations: Evaluations,
  callback: Callback
) => {
  const { shouldStop, shouldExecute } = evaluations;
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

  observer.observe(document.querySelector(selector), {
    attributes: true,
    childList: true
  });
};
