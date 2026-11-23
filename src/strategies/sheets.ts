import type { UiStrategyConfig } from "src/types";

import { createZoomDriver } from "./base";

/**
 * This function tells us if the sheets is in preview mode. There is no menu in preview mode, so we can't zoom
 *
 * example preview URL: "/spreadsheets/u/0/d/XXXX-XX/preview/sheet";
 * example preview URL: "/spreadsheets/u/0/d/XXXX-XX/preview";
 */
const isUIPreview = (href: string): boolean => /\/preview(\/sheet)?$/.test(new URL(href).pathname);

export const createSheetsDriver = (config: UiStrategyConfig) =>
  createZoomDriver(config, { isUIPreview });
