export const isChrome = () => {
  return process.env.PLASMO_BROWSER === "chrome";
};

export const isEdge = () => {
  return process.env.PLASMO_BROWSER === "edge";
};

export const showExtensionVersionsTab = () => {
  return isChrome() || isEdge();
};
