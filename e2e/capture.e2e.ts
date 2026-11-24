/// <reference types="node" />
import { existsSync, readFileSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Page } from "playwright";
import { afterAll, describe, expect, test } from "vitest";

import { describeLocation, findSelectors, withPublicPage } from "./harness";
import {
  CAPTURE_TARGETS,
  type CaptureTarget,
  FIT_LABELS_PATH,
  LIVE_VIEW_ONLY_DOC_URL,
  LOCALE_CODES,
  RAW_DIR
} from "./targets";

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

// The Zoom item's label is translated, its icon is not (the content script falls back to the same icon)
const ZOOM_ITEM_WITH_ICON = ".goog-menuitem:has(.docs-icon-editors-ia-zoom-in):visible";
// Docs ends the Fit row's aria-label with its accelerator key: "Fit f", "התאמה f"
const FIT_ACCELERATOR = / f$/i;

// The aria-label of the first row of the open menu that lists the zoom presets: the Fit row
const waitForFitRowLabel = async (page: Page): Promise<string> => {
  const handle = await page.waitForFunction(
    () => {
      for (const menu of Array.from(document.querySelectorAll(".goog-menu"))) {
        const rows = Array.from(menu.querySelectorAll(".goog-menuitem.apps-menuitem"));

        if (
          menu.getClientRects().length > 0 &&
          rows.some((row) => /(^|\D)50(\D|$)/.test(row.textContent ?? ""))
        ) {
          const label =
            rows[0].getAttribute("aria-label") ??
            rows[0].querySelector("[aria-label]")?.getAttribute("aria-label");
          return label || null;
        }
      }

      return null;
    },
    undefined,
    { timeout: CONTROL_TIMEOUT_MS }
  );

  return handle.jsonValue() as Promise<string>;
};

const readFitLabel = async (page: Page): Promise<string> => {
  await page.goto(LIVE_VIEW_ONLY_DOC_URL);
  await waitForEnabled(page, "#docs-view-menu:not(.goog-control-disabled)");
  await page.click("#docs-view-menu");

  const zoomItem = page.locator(ZOOM_ITEM_WITH_ICON).first();
  try {
    await zoomItem.waitFor({ timeout: MENU_TIMEOUT_MS });
  } catch {
    throw new Error(
      "The View menu shows no item with the zoom icon. Docs only has View > Zoom when the Doc can't be edited: " +
        "set E2E_LIVE_VIEW_ONLY_DOC_URL to a public Doc shared as Viewer"
    );
  }
  await zoomItem.hover();
  await zoomItem.click();

  const ariaLabel = await waitForFitRowLabel(page);
  if (!FIT_ACCELERATOR.test(ariaLabel)) {
    throw new Error(
      `The Fit row's aria-label "${ariaLabel}" no longer ends with its accelerator key (" f")`
    );
  }

  return ariaLabel.replace(FIT_ACCELERATOR, "");
};

const readRecordedFitLabels = (): Record<string, string> =>
  existsSync(FIT_LABELS_PATH) ? JSON.parse(readFileSync(FIT_LABELS_PATH, "utf8")) : {};

// Both zoom flows find Docs' Fit row by popupDocsDropdownFitSelection, so that message has to be the text Docs shows,
// which a translation service can't know. This records it from live Docs in every language the extension ships, and
// fails when Docs changed it. A language that fails keeps the label it had.
describe("capture Docs' Fit label in each language (signed out)", () => {
  const recorded = readRecordedFitLabels();
  const captured: Record<string, string> = {};

  afterAll(async () => {
    if (Object.keys(captured).length === 0) {
      return;
    }

    const merged = { ...recorded, ...captured };
    const sorted = Object.fromEntries(
      Object.keys(merged)
        .sort()
        .map((code) => [code, merged[code]])
    );
    await writeFile(FIT_LABELS_PATH, `${JSON.stringify(sorted, null, 2)}\n`);
  });

  test.each(LOCALE_CODES)("%s", (code) =>
    withPublicPage(
      `capture-fit-${code}`,
      async (page) => {
        const label = await readFitLabel(page);
        captured[code] = label;

        if (code in recorded) {
          expect(
            label,
            `Docs now shows "${label}" on the Fit row in ${code}, not "${recorded[code]}". The file is updated: ` +
              "review it, then set popupDocsDropdownFitSelection to match"
          ).toBe(recorded[code]);
        }
      },
      { locale: code }
    )
  );
});
