export const isChrome = () => {
  return import.meta.env.BROWSER === "chrome";
};

export const isEdge = () => {
  return import.meta.env.BROWSER === "edge";
};

export const showExtensionVersionsTab = () => {
  return isChrome() || isEdge();
};
