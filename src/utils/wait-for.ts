// Resolves with the first element that matches the selector and passes `matches`, or null once
// timeoutMs has passed
export const waitFor = (
  selector: string,
  timeoutMs: number,
  matches: (element: Element) => boolean = () => true
): Promise<Element | null> => {
  const find = () => Array.from(document.querySelectorAll(selector)).find(matches) ?? null;

  const existing = find();

  if (existing) {
    return Promise.resolve(existing);
  }

  const { promise, resolve } = Promise.withResolvers<Element | null>();

  const finish = (element: Element | null) => {
    observer.disconnect();
    clearTimeout(timer);
    resolve(element);
  };

  // attributes too: the selectors can match on `aria-label` and `class`
  const observer = new MutationObserver(() => {
    const element = find();

    if (element) {
      finish(element);
    }
  });
  const timer = setTimeout(() => finish(null), timeoutMs);

  observer.observe(document.body, { childList: true, subtree: true, attributes: true });

  return promise;
};
