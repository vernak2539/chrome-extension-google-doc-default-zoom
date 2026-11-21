// Resolves with the first element that matches, or null once timeoutMs has passed
export const waitFor = (selector: string, timeoutMs: number): Promise<Element | null> => {
  const existing = document.querySelector(selector);

  if (existing) {
    return Promise.resolve(existing);
  }

  return new Promise((resolve) => {
    const finish = (element: Element | null) => {
      observer.disconnect();
      clearTimeout(timer);
      resolve(element);
    };

    // attributes too: the selectors can match on `aria-label` and `class`
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);

      if (element) {
        finish(element);
      }
    });
    const timer = setTimeout(() => finish(null), timeoutMs);

    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
  });
};
