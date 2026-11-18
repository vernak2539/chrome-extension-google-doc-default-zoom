/// <reference types="node" />
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Page } from "playwright";
import { describe, test } from "vitest";

import { findSelectors, withPublicPage } from "./harness";
import { CAPTURE_TARGETS, type CaptureTarget, RAW_DIR } from "./targets";

const CONTROL_TIMEOUT_MS = 30_000;
const KNOWN_SELECTORS = [
  "#docs-chrome",
  "#docs-toolbar",
  "#zoomSelect",
  "#t-zoom",
  "#docs-view-menu"
];

// A control that is still disabled means the page is still loading
const waitForEnabled = async (page: Page, selector: string) => {
  try {
    await page.waitForSelector(selector, { timeout: CONTROL_TIMEOUT_MS });
  } catch {
    const found = await findSelectors(page, KNOWN_SELECTORS);
    throw new Error(
      `${selector} never became available signed out; selectors found: ${found.join(", ") || "none"}`
    );
  }
};

const openZoomMenu = async (page: Page, target: CaptureTarget) => {
  if (target.mode === "editor") {
    const control = target.zoomControlSelector;
    await waitForEnabled(page, `${control}:not(.goog-toolbar-combo-button-disabled)`);
    await page.click(control!);
    // Docs and Sheets set aria-owns once the menu is open
    await page.waitForSelector(`${control}[aria-owns]`, { timeout: CONTROL_TIMEOUT_MS });
    return;
  }

  await waitForEnabled(page, "#docs-view-menu:not(.goog-control-disabled)");
  await page.click("#docs-view-menu");
  await page.hover("span[aria-label^='Zoom']");
  await page.click("span[aria-label^='Zoom']");
  await page.waitForSelector("[aria-label^='Fit']", { timeout: CONTROL_TIMEOUT_MS });
};

// Saves the page as Google serves it. It holds document specific data, so it stays in the gitignored raw
// directory until the sanitize step has cleaned it.
describe("capture the raw pages (signed out)", () => {
  test.each(CAPTURE_TARGETS)("$name", (target) =>
    withPublicPage(`capture-${target.name}`, async (page) => {
      await page.goto(target.url);
      await openZoomMenu(page, target);

      await mkdir(RAW_DIR, { recursive: true });
      await writeFile(path.join(RAW_DIR, `${target.name}.html`), await page.content());
    })
  );
});
