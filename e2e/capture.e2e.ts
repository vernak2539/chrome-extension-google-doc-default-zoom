/// <reference types="node" />
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Page } from "playwright";
import { describe, test } from "vitest";

import { describeLocation, findSelectors, withPublicPage } from "./harness";
import { CAPTURE_TARGETS, type CaptureTarget, RAW_DIR } from "./targets";

const CONTROL_TIMEOUT_MS = 30_000;
const MENU_TIMEOUT_MS = 10_000;
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
      `${selector} never became available signed out; ${describeLocation(page)}; selectors found: ${found.join(", ") || "none"}`
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
  const zoomItem = page.locator("span[aria-label^='Zoom']:visible").first();
  try {
    await zoomItem.waitFor({ timeout: MENU_TIMEOUT_MS });
  } catch {
    throw new Error(
      "The View menu shows no Zoom item. Docs only has View > Zoom when the Doc can't be edited, so this " +
        "Doc is probably editable signed out: set E2E_LIVE_VIEW_ONLY_DOC_URL to a public Doc shared as Viewer"
    );
  }
  await zoomItem.hover();
  await zoomItem.click();
  await page.waitForSelector("[aria-label^='Fit']", { timeout: CONTROL_TIMEOUT_MS });
};

// Saves the page as Google serves it. It holds document specific data, so it stays in the gitignored raw
// directory until the sanitize step has cleaned it.
describe("capture the raw pages (signed out)", () => {
  test.each(CAPTURE_TARGETS)("$name", (target) =>
    withPublicPage(`capture-${target.name}`, async (page) => {
      const rawPath = path.join(RAW_DIR, `${target.name}.html`);
      // a failed capture must not leave an older raw file for the sanitize step to pick up
      await rm(rawPath, { force: true });

      await page.goto(target.url);
      await openZoomMenu(page, target);

      await mkdir(RAW_DIR, { recursive: true });
      await writeFile(rawPath, await page.content());
    })
  );
});
