export const CUSTOM_ZOOM_MIN = 50;
export const CUSTOM_ZOOM_MAX = 200;

/** Turns what the user typed into the stored zoom string: a whole percent clamped to 50–200 with a "%" suffix, or "" when nothing numeric was typed */
export const toCustomZoomValue = (input: string): string => {
  const percent = Number.parseInt(input, 10);
  if (Number.isNaN(percent)) return "";
  return `${Math.min(Math.max(percent, CUSTOM_ZOOM_MIN), CUSTOM_ZOOM_MAX)}%`;
};
