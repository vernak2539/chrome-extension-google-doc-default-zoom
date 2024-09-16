const localize = (key: string) => {
  if (!chrome || !chrome.i18n || !chrome.i18n.getMessage) {
    return key;
  }

  return chrome.i18n.getMessage(key);
};

export default localize;
