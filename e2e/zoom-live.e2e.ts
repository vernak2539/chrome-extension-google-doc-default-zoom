import type { Page } from "playwright";
import { describe, expect, test } from "vitest";

import {
  describeLocation,
  findSelectors,
  getEdition,
  hasFocus,
  installRecorder,
  openUnfocusedPage,
  readRecorded,
  setAppState,
  waitForDismissals,
  withExtension
} from "./harness";
import { LIVE_DOC_URL, LIVE_PAGE_SELECTORS, LIVE_SHEET_URL } from "./targets";

const edition = getEdition();
const PAGE_TIMEOUT_MS = 30_000;

type LiveApp = "docs" | "sheets";

// Where each app takes the document's keys: Docs in a hidden iframe, Sheets in the cell editor. Inside the Docs iframe
// the focused element varies even without the extension: selecting a background tab moves it to the iframe's body.
const DOCUMENT_FOCUS_SELECTOR: Record<LiveApp, string> = {
  docs: ".docs-texteventtarget-iframe",
  sheets: "#waffle-rich-text-editor"
};

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

// Google leaves focus in the zoom box after a zoom, so the flow puts it back where the document takes its keys
const expectDocumentFocused = async (page: Page, app: LiveApp) => {
  await expect
    .poll(
      () =>
        page.evaluate(
          (selector) => !!document.activeElement?.matches(selector),
          DOCUMENT_FOCUS_SELECTOR[app]
        ),
      { timeout: PAGE_TIMEOUT_MS }
    )
    .toBe(true);
};

// The control is enabled once the page has loaded: from then on the content script acts, or waits
const waitForZoomControl = async (page: Page, selector: string) => {
  await page.waitForSelector(`${selector}:not(.goog-toolbar-combo-button-disabled)`, {
    timeout: PAGE_TIMEOUT_MS
  });
};

// The content script sets the zoom box value before pressing Enter, so the value alone proves nothing. Once focus
// leaves the box, Docs and Sheets show the zoom they applied and drop a value they ignored (#110). The flow moves
// focus back to the document, which takes it out of the box.
const expectAppliedCustomZoom = async (page: Page, app: LiveApp, zoomValue: string) => {
  await expect
    .poll(async () => (await readRecorded(page)).enters.at(-1) ?? "", { timeout: PAGE_TIMEOUT_MS })
    .toBe(zoomValue);
  await expectDocumentFocused(page, app);
  await page.waitForTimeout(500);
  expect(await page.inputValue(app === "docs" ? "#zoomSelect input" : "#t-zoom input")).toBe(
    zoomValue
  );
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
      // only the toolbar flow uses the zoom box; the view-only flow has no document to type in
      if (await page.$("#zoomSelect input")) {
        await expectDocumentFocused(page, "docs");
      }
    }));

  // Picking a row works without focus, which is why a preset doesn't wait for it
  test("Docs applies 150% in a background tab", () =>
    withExtension("live-docs-unfocused", async ({ context, serviceWorker }) => {
      await setAppState(serviceWorker, "docs", {
        zoomValue: "150%",
        viewOnly: false,
        classroomSupport: false
      });
      await installRecorder(context);
      const page = await openUnfocusedPage(context, LIVE_DOC_URL);

      await waitForChrome(page);
      await waitForZoomClick(page, "150%");
      await expectZoomBoxValue(page, "#zoomSelect input", "150%");
      expect(await hasFocus(page)).toBe(false);

      // selecting the tab gives the document its keys (Docs does this itself; the flow must not undo it)
      await page.bringToFront();
      await expectDocumentFocused(page, "docs");
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
      await expectDocumentFocused(page, "sheets");
    }));

  test.skipIf(edition === "base")("Docs applies a custom 137% zoom", () =>
    withExtension("live-docs-custom", async ({ context, serviceWorker }) => {
      await setAppState(serviceWorker, "docs", {
        zoomValue: "137%",
        viewOnly: false,
        classroomSupport: false
      });
      await installRecorder(context);
      const page = await context.newPage();
      await page.goto(LIVE_DOC_URL);

      await waitForChrome(page);
      await expectAppliedCustomZoom(page, "docs", "137%");
    })
  );

  test.skipIf(edition === "base")("Sheets applies a custom 137% zoom", () =>
    withExtension("live-sheets-custom", async ({ context, serviceWorker }) => {
      await setAppState(serviceWorker, "sheets", {
        zoomValue: "137%",
        viewOnly: false,
        classroomSupport: false
      });
      await installRecorder(context);
      const page = await context.newPage();
      await page.goto(LIVE_SHEET_URL);

      await waitForChrome(page);
      await expectAppliedCustomZoom(page, "sheets", "137%");
    })
  );

  // #77: in a background tab Google ignores a typed zoom, so the flow waits until the tab is selected
  for (const app of ["docs", "sheets"] as const) {
    test.skipIf(edition === "base")(
      `${app === "docs" ? "Docs" : "Sheets"} types a custom 137% zoom once a background tab is selected`,
      () =>
        withExtension(`live-${app}-custom-unfocused`, async ({ context, serviceWorker }) => {
          await setAppState(serviceWorker, app, {
            zoomValue: "137%",
            viewOnly: false,
            classroomSupport: false
          });
          await installRecorder(context);
          const page = await openUnfocusedPage(
            context,
            app === "docs" ? LIVE_DOC_URL : LIVE_SHEET_URL
          );

          await waitForChrome(page);
          await waitForZoomControl(page, app === "docs" ? "#zoomSelect" : "#t-zoom");
          await page.waitForTimeout(3_000);
          expect((await readRecorded(page)).enters).toEqual([]);
          expect(await hasFocus(page)).toBe(false);

          await page.bringToFront();
          await expectAppliedCustomZoom(page, app, "137%");
        })
    );
  }

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
        await expectDocumentFocused(page, "sheets");
      })
  );
});
