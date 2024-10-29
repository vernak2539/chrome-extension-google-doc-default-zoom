type Callback = () => void;

export const onElementAvailable = (selector: string, callback: Callback) => {
  const observer = new MutationObserver((mutations) => {
    if (document.querySelector(selector)) {
      observer.disconnect();
      callback();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
};
