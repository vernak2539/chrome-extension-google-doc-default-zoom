import type { Page, Worker } from "playwright";
import { describe, expect, test } from "vitest";

import docsFitLabels from "../src/strategies/docs-fit-labels.json";
import {
  describeLocation,
  findSelectors,
  getEdition,
  hasFocus,
  installRecorder,
  openUnfocusedPage,
  readRecorded,
  setAppState,
  waitForClicks,
  waitForDismissals,
  withExtension
} from "./harness";
import {
  LIVE_DOC_URL,
  LIVE_PAGE_SELECTORS,
  LIVE_SHEET_URL,
  LIVE_VIEW_ONLY_DOC_URL,
  LOCALE_CODES
} from "./targets";

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

// Waits for a click on the Fit row. In View > Zoom the row's text goes on with its shortcut ("Fit⌘+Option+[").
const waitForFitClick = async (page: Page, fitLabel: string) => {
  try {
    await expect
      .poll(async () => (await readRecorded(page)).clicks.at(-1) ?? "", {
        timeout: PAGE_TIMEOUT_MS
      })
      .toMatch(new RegExp(`^${RegExp.escape(fitLabel)}`));
  } catch (error) {
    const pageLanguage = await page.evaluate(() => document.documentElement.lang);
    throw new Error(
      `no click on the "${fitLabel}" row (the page is in "${pageLanguage}"); ${await describeFoundSelectors(page)}`,
      { cause: error }
    );
  }
};

// The Fit label the extension uses, as the popup would save it. Fails when the browser did not start in `language`,
// because the test would then check the English label.
const readExtensionFitLabel = async (serviceWorker: Worker, language: string) => {
  const { uiLanguage, fitLabel } = await serviceWorker.evaluate(() => ({
    uiLanguage: chrome.i18n.getUILanguage(),
    fitLabel: chrome.i18n.getMessage("popupDocsDropdownFitSelection")
  }));
  expect(uiLanguage, `Chromium did not start in ${language}`).toMatch(new RegExp(`^${language}`));

  return fitLabel;
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

// A language Docs serves and the extension doesn't ship: chrome.i18n falls back to the English "Fit" while Docs shows
// its own label. The flows find Fit by its structure, so this works on every platform: macOS keeps the extension in
// English whatever `language` says, and Linux falls back because there is no such locale.
describe.each(["pt-BR", "ko"])(
  `Docs in %s, a language the extension doesn't ship (${edition} edition)`,
  (language) => {
    const NO_DIGIT = /^\D+$/;

    const readEnglishFitLabel = async (serviceWorker: Worker) => {
      const fitLabel = await serviceWorker.evaluate(() =>
        chrome.i18n.getMessage("popupDocsDropdownFitSelection")
      );
      expect(fitLabel).toBe(docsFitLabels.en);

      return fitLabel;
    };

    test(`toolbar Docs applies Fit in ${language}`, () =>
      withExtension(
        `live-docs-fit-unshipped-${language}`,
        async ({ context, serviceWorker }) => {
          await setAppState(serviceWorker, "docs", {
            zoomValue: await readEnglishFitLabel(serviceWorker),
            viewOnly: false,
            classroomSupport: false
          });
          await installRecorder(context);
          const page = await context.newPage();
          await page.goto(LIVE_DOC_URL);

          await waitForChrome(page);
          await waitForClicks(page, 1);
          const [clicked] = (await readRecorded(page)).clicks;
          expect(clicked, "the row clicked is Docs' Fit row, in Docs' language").toMatch(NO_DIGIT);
          expect(clicked.startsWith(docsFitLabels.en)).toBe(false);
          await expectZoomMenuClosed(page, clicked);
        },
        { language }
      ));

    // View > Zoom is the same in both editions, so Base checks it once
    test.skipIf(edition === "extended")(`view-only Docs applies 150% in ${language}`, () =>
      withExtension(
        `live-docs-view-only-150-unshipped-${language}`,
        async ({ context, serviceWorker }) => {
          await setAppState(serviceWorker, "docs", {
            zoomValue: "150%",
            viewOnly: true,
            classroomSupport: false
          });
          await installRecorder(context);
          const page = await context.newPage();
          await page.goto(LIVE_VIEW_ONLY_DOC_URL);

          await waitForChrome(page);
          await waitForZoomClick(page, "150%");
        },
        { language }
      )
    );

    test.skipIf(edition === "extended")(`view-only Docs applies Fit in ${language}`, () =>
      withExtension(
        `live-docs-view-only-fit-unshipped-${language}`,
        async ({ context, serviceWorker }) => {
          await setAppState(serviceWorker, "docs", {
            zoomValue: await readEnglishFitLabel(serviceWorker),
            viewOnly: true,
            classroomSupport: false
          });
          await installRecorder(context);
          const page = await context.newPage();
          await page.goto(LIVE_VIEW_ONLY_DOC_URL);

          await waitForChrome(page);
          // the first click is View > Zoom, the second is the zoom row: its text goes on with its shortcut ("Fit⌘+Option+[")
          await waitForClicks(page, 2);
          const [, clicked] = (await readRecorded(page)).clicks;
          expect(clicked).toMatch(NO_DIGIT);
          expect(clicked.endsWith("[")).toBe(true);
        },
        { language }
      )
    );
  }
);

// Fit is the one zoom value whose row Docs translates (#172), so it is checked in every language the extension ships.
// The extension takes the label from its own locale, and Docs serves the browser's language. Only Chromium on Linux
// takes its UI language from LANGUAGE (macOS ignores it), so these run in CI or a Linux container.
describe.runIf(process.platform === "linux")(
  `Fit on the live Docs pages in each language (${edition} edition)`,
  () => {
    // The toolbar flow differs by edition: Extended types a value that is not in its zoom list
    test.each(LOCALE_CODES)("Docs applies Fit in %s", (language) =>
      withExtension(
        `live-docs-fit-${language}`,
        async ({ context, serviceWorker }) => {
          const fitLabel = await readExtensionFitLabel(serviceWorker, language);
          // the row Docs shows, which is also the saved value until #106
          const shownLabel = docsFitLabels[language];
          await setAppState(serviceWorker, "docs", {
            zoomValue: fitLabel,
            viewOnly: false,
            classroomSupport: false
          });
          await installRecorder(context);
          const page = await context.newPage();
          await page.goto(LIVE_DOC_URL);

          await waitForChrome(page);
          await waitForFitClick(page, shownLabel);
          await expectZoomMenuClosed(page, shownLabel);
          expect((await readRecorded(page)).enters).toEqual([]);
        },
        { language }
      )
    );

    // View > Zoom is the same in both editions, so Base checks it once
    test.skipIf(edition === "extended").each(LOCALE_CODES)(
      "view-only Docs applies Fit in %s",
      (language) =>
        withExtension(
          `live-docs-view-only-fit-${language}`,
          async ({ context, serviceWorker }) => {
            const fitLabel = await readExtensionFitLabel(serviceWorker, language);
            await setAppState(serviceWorker, "docs", {
              zoomValue: fitLabel,
              viewOnly: true,
              classroomSupport: false
            });
            await installRecorder(context);
            const page = await context.newPage();
            await page.goto(LIVE_VIEW_ONLY_DOC_URL);

            await waitForChrome(page);
            await waitForFitClick(page, docsFitLabels[language]);
          },
          { language }
        )
    );
  }
);
