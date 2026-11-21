import type { Page } from "playwright";
import { describe, expect, test } from "vitest";

import {
  describeLocation,
  findSelectors,
  getEdition,
  installRecorder,
  readRecorded,
  setAppState,
  waitForDismissals,
  withExtension
} from "./harness";
import { LIVE_DOC_URL, LIVE_PAGE_SELECTORS, LIVE_SHEET_URL } from "./targets";

const edition = getEdition();
const PAGE_TIMEOUT_MS = 30_000;

const describeFoundSelectors = async (page: Page) =>
  `${describeLocation(page)}; selectors found on the page: ${(await findSelectors(page, LIVE_PAGE_SELECTORS)).join(", ") || "none"}`;

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

// The zoom dropdown is closed once no visible menu still lists the zoom value as a row
const expectZoomMenuClosed = async (page: Page, zoomValue: string) => {
  await expect
    .poll(
      () =>
        page.evaluate(
          (value) =>
            Array.from(document.querySelectorAll(".goog-menu")).some(
              (menu) =>
                menu.getClientRects().length > 0 &&
                Array.from(menu.querySelectorAll(".goog-menuitem")).some(
                  (row) => row.firstChild?.textContent === value
                )
            ),
          zoomValue
        ),
      { timeout: PAGE_TIMEOUT_MS }
    )
    .toBe(false);
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
      await expectZoomMenuClosed(page, "150%");
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
      await expectZoomMenuClosed(page, "125%");
    }));

  // No row is clicked here, so only the outside press can close the menu the flow opened. Base cannot
  // type a custom value, so it opens the menu, finds no "140%" row and gives up.
  test.skipIf(edition === "extended")(
    "Sheets closes the zoom menu it opened when no row matches",
    () =>
      withExtension("live-sheets-no-row", async ({ context, serviceWorker }) => {
        await setAppState(serviceWorker, "sheets", {
          zoomValue: "140%",
          viewOnly: false,
          classroomSupport: false
        });
        await installRecorder(context);
        const page = await context.newPage();
        await page.goto(LIVE_SHEET_URL);

        await waitForChrome(page);
        await waitForDismissals(page, 1);
        await expectZoomMenuClosed(page, "125%");
      })
  );
});
