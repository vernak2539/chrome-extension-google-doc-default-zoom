/// <reference types="node" />
import type { Page } from "playwright";
import { describe, expect, test } from "vitest";

import {
  type AppState,
  type ExtensionSession,
  FIXTURE_DOC_URL,
  FIXTURE_SHEET_URL,
  getEdition,
  hasFocus,
  insertFixture,
  installRecorder,
  installStorageRecorder,
  openPopup,
  openUnfocusedPage,
  popupZoomSelect,
  readRecorded,
  readStorageWrites,
  serveFixture,
  setAppState,
  setPlainAppState,
  waitForClicks,
  waitForControlClicks,
  waitForEnters,
  waitForStorageWrites,
  withExtension
} from "./harness";

const edition = getEdition();

const openPage = async ({ context }: ExtensionSession, url: string) => {
  await installRecorder(context);
  await serveFixture(context);
  const page = await context.newPage();
  await page.goto(url);
  return page;
};

// A background tab: see openUnfocusedPage
const openPageWithoutFocus = async ({ context }: ExtensionSession, url: string) => {
  await installRecorder(context);
  await serveFixture(context);
  return openUnfocusedPage(context, url);
};

// The fixtures leave out the element that takes the document's keys (in Docs an iframe), so a test that checks where
// focus goes adds a focused stand-in before the fixture
const focusStandInEditor = (page: Page) =>
  page.evaluate(() => {
    const editor = document.createElement("textarea");
    editor.id = "e2e-editor";
    document.body.append(editor);
    editor.focus();
  });

const state = (zoomValue: string, viewOnly = false): AppState => ({
  zoomValue,
  viewOnly,
  classroomSupport: false
});

describe(`zoom flow against saved Docs and Sheets markup (${edition} edition)`, () => {
  test("Docs applies a preset zoom by clicking its menu row", () =>
    withExtension("docs-preset", async (session) => {
      await setAppState(session.serviceWorker, "docs", state("150%"));
      const page = await openPage(session, FIXTURE_DOC_URL);

      await insertFixture(page, "docs-editor");
      await waitForClicks(page, 1);

      expect((await readRecorded(page)).clicks).toEqual(["150%"]);
    }));

  // Every other test seeds JSON text. Builds from before settings went back to JSON text wrote plain values.
  test("Docs applies a preset zoom saved as plain values", () =>
    withExtension("docs-plain-values", async (session) => {
      await setPlainAppState(session.serviceWorker, "docs", state("150%"));
      const page = await openPage(session, FIXTURE_DOC_URL);

      await insertFixture(page, "docs-editor");
      await waitForClicks(page, 1);

      expect((await readRecorded(page)).clicks).toEqual(["150%"]);
    }));

  test("Sheets applies a preset zoom by clicking its menu row", () =>
    withExtension("sheets-preset", async (session) => {
      await setAppState(session.serviceWorker, "sheets", state("125%"));
      const page = await openPage(session, FIXTURE_SHEET_URL);

      await insertFixture(page, "sheets-editor");
      await waitForClicks(page, 1);

      expect((await readRecorded(page)).clicks).toEqual(["125%"]);
    }));

  test.skipIf(edition === "base")("Docs types a custom zoom into the zoom box", () =>
    withExtension("docs-custom", async (session) => {
      await setAppState(session.serviceWorker, "docs", state("140%"));
      const page = await openPage(session, FIXTURE_DOC_URL);

      await focusStandInEditor(page);
      await insertFixture(page, "docs-editor");
      await waitForEnters(page, 1);

      const recorded = await readRecorded(page);
      expect(recorded.enters).toEqual(["140%"]);
      expect(recorded.clicks).toEqual([]);
      expect(await page.inputValue("#zoomSelect input")).toBe("140%");
      // focus goes back to the document, so typing doesn't land in the zoom box
      await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe("e2e-editor");
    })
  );

  test.skipIf(edition === "base")("Docs types a custom zoom only once the page has focus", () =>
    withExtension("docs-custom-unfocused", async (session) => {
      await setAppState(session.serviceWorker, "docs", state("140%"));
      const page = await openPageWithoutFocus(session, FIXTURE_DOC_URL);

      await insertFixture(page, "docs-editor");
      await page.waitForTimeout(2000);
      expect(await readRecorded(page)).toMatchObject({ controlClicks: [], enters: [] });
      expect(await hasFocus(page)).toBe(false);

      await page.bringToFront();
      await waitForEnters(page, 1);

      expect((await readRecorded(page)).enters).toEqual(["140%"]);
    })
  );

  // Picking a row works without focus, so a preset does not wait
  test("Docs applies a preset zoom in a page without focus", () =>
    withExtension("docs-preset-unfocused", async (session) => {
      await setAppState(session.serviceWorker, "docs", state("150%"));
      const page = await openPageWithoutFocus(session, FIXTURE_DOC_URL);

      await insertFixture(page, "docs-editor");
      await waitForClicks(page, 1);

      expect((await readRecorded(page)).clicks).toEqual(["150%"]);
      expect(await hasFocus(page)).toBe(false);
    }));

  test.skipIf(edition === "extended")(
    "Docs opens the zoom menu for a custom zoom but selects no row and types nothing",
    () =>
      withExtension("docs-custom-base", async (session) => {
        await setAppState(session.serviceWorker, "docs", state("140%"));
        const page = await openPage(session, FIXTURE_DOC_URL);

        await insertFixture(page, "docs-editor");
        // the content script ran: it opened the zoom menu, found no "140%" row and gave up
        await waitForControlClicks(page, 1);
        await page.waitForTimeout(1000);

        const recorded = await readRecorded(page);
        expect(recorded.controlClicks).toEqual(["zoomSelect"]);
        expect(recorded.clicks).toEqual([]);
        expect(recorded.enters).toEqual([]);
        // the input was never focused, so the flow closes the menu it opened with an outside press on body
        expect(recorded.dismissals).toEqual(["body"]);
      })
  );

  test("Docs view-only opens View > Zoom and clicks the zoom row", () =>
    withExtension("docs-view-only", async (session) => {
      await setAppState(session.serviceWorker, "docs", state("150%", true));
      const page = await openPage(session, FIXTURE_DOC_URL);

      await insertFixture(page, "docs-view-only");
      // the flow waits one second for the View menu to open
      await waitForClicks(page, 2);

      const { clicks } = await readRecorded(page);
      expect(clicks).toHaveLength(2);
      expect(clicks[0]).toMatch(/^Zoom/);
      // the whole value, so "50%" can never stand in for "150%"
      expect(clicks[1]).toMatch(/(^|\D)150%(\D|$)/);
    }));

  test("Docs waits while the zoom control is disabled, then applies the zoom", () =>
    withExtension("docs-page-loading", async (session) => {
      await setAppState(session.serviceWorker, "docs", state("150%"));
      const page = await openPage(session, FIXTURE_DOC_URL);

      await insertFixture(page, "docs-editor", { zoomControlDisabled: true });
      await page.waitForTimeout(1500);
      expect((await readRecorded(page)).clicks).toEqual([]);

      // only the class of the zoom control changes, which is a descendant of the watched toolbar
      await page.evaluate(() => {
        document
          .querySelector("#zoomSelect")
          ?.classList.remove("goog-toolbar-combo-button-disabled");
      });
      await waitForClicks(page, 1);

      expect((await readRecorded(page)).clicks).toEqual(["150%"]);
    }));

  // The other tests write the setting from the service worker. This one saves it the way a user
  // does, so it also covers the popup: what it writes, and that opening it writes nothing.
  test("Docs applies a zoom picked in the popup, and a new pick after a reload", () =>
    withExtension("popup-round-trip", async (session) => {
      // before the popup opens, so its announcements request never reaches the network
      await serveFixture(session.context);
      await installStorageRecorder(session.context);
      await installRecorder(session.context);

      const popup = await openPopup(session);
      expect(await readStorageWrites(popup)).toEqual([]);

      // JSON text, which a synced device still on a Plasmo version can read
      await popupZoomSelect(popup, "Docs").selectOption("150%");
      await waitForStorageWrites(popup, 1);
      expect(await readStorageWrites(popup)).toEqual([
        { area: "sync", method: "set", arg: { docs: JSON.stringify(state("150%")) } }
      ]);

      const docsPage = await session.context.newPage();
      await docsPage.goto(FIXTURE_DOC_URL);
      await insertFixture(docsPage, "docs-editor");
      await waitForClicks(docsPage, 1);
      expect((await readRecorded(docsPage)).clicks).toEqual(["150%"]);

      await popupZoomSelect(popup, "Docs").selectOption("75%");
      await waitForStorageWrites(popup, 2);
      expect(await readStorageWrites(popup)).toEqual([
        { area: "sync", method: "set", arg: { docs: JSON.stringify(state("150%")) } },
        { area: "sync", method: "set", arg: { docs: JSON.stringify(state("75%")) } }
      ]);

      await docsPage.reload();
      await insertFixture(docsPage, "docs-editor");
      await waitForClicks(docsPage, 1);
      expect((await readRecorded(docsPage)).clicks).toEqual(["75%"]);
    }));
});
