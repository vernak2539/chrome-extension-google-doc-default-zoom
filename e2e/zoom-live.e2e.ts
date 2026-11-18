import type { Page } from "playwright";
import { describe, expect, test } from "vitest";

import {
  describeLocation,
  findSelectors,
  getEdition,
  installRecorder,
  readRecorded,
  setAppState,
  withExtension
} from "./harness";
import { LIVE_DOC_URL, LIVE_SHEET_URL } from "./targets";

const edition = getEdition();
const PAGE_TIMEOUT_MS = 30_000;
const KNOWN_SELECTORS = [
  "#docs-chrome",
  "#docs-toolbar",
  "#zoomSelect",
  "#t-zoom",
  "#docs-view-menu",
  "canvas"
];

const describeFoundSelectors = async (page: Page) =>
  `${describeLocation(page)}; selectors found on the page: ${(await findSelectors(page, KNOWN_SELECTORS)).join(", ") || "none"}`;

const waitForChrome = async (page: Page) => {
  try {
    await page.waitForSelector("#docs-chrome", { timeout: PAGE_TIMEOUT_MS });
  } catch {
    throw new Error(
      `#docs-chrome never appeared (blocked, sign-in wall or markup change); ${await describeFoundSelectors(page)}`
    );
  }
};

// Waits for a click on a row that holds the whole zoom value ("50%" must not stand in for "150%")
const waitForZoomClick = async (page: Page, zoomValue: string) => {
  const pattern = new RegExp(`(^|\\D)${zoomValue}(\\D|$)`);

  try {
    await expect
      .poll(
        async () => {
          const { clicks } = await readRecorded(page);
          return clicks.at(-1) ?? "";
        },
        { timeout: PAGE_TIMEOUT_MS }
      )
      .toMatch(pattern);
  } catch (error) {
    throw new Error(`no zoom row click for ${zoomValue}; ${await describeFoundSelectors(page)}`, {
      cause: error
    });
  }
};

const expectZoomBoxValue = async (page: Page, selector: string, zoomValue: string) => {
  if (await page.$(selector)) {
    await expect
      .poll(() => page.inputValue(selector), { timeout: PAGE_TIMEOUT_MS })
      .toBe(zoomValue);
  }
};

// These open the maintainer's public documents signed out. Nothing here signs in to Google.
describe(`zoom flow on the live Docs and Sheets pages (${edition} edition)`, () => {
  test("Docs applies 150%", () =>
    withExtension("live-docs", async ({ context, serviceWorker }) => {
      // viewOnly is on so that the view-only flow runs when the signed-out page has no zoom box
      await setAppState(serviceWorker, "docs", {
        zoomValue: "150%",
        viewOnly: true,
        classroomSupport: false
      });
      await installRecorder(context);
      const page = await context.newPage();
      await page.goto(LIVE_DOC_URL);

      await waitForChrome(page);
      await waitForZoomClick(page, "150%");
      await expectZoomBoxValue(page, "#zoomSelect input", "150%");
    }));

  test("Sheets applies 125%", () =>
    withExtension("live-sheets", async ({ context, serviceWorker }) => {
      await setAppState(serviceWorker, "sheets", {
        zoomValue: "125%",
        viewOnly: false,
        classroomSupport: false
      });
      await installRecorder(context);
      const page = await context.newPage();
      await page.goto(LIVE_SHEET_URL);

      await waitForChrome(page);
      await waitForZoomClick(page, "125%");
      await expectZoomBoxValue(page, "#t-zoom input", "125%");
    }));
});
