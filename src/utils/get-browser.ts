export const isChrome = () => {
  return process.env.PLASMO_BROWSER === "chrome";
};

export const isFirefox = () => {
  return process.env.PLASMO_BROWSER === "firefox";
};

export const isEdge = () => {
  return process.env.PLASMO_BROWSER === "edge";
};
