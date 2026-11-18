/// <reference types="node" />
import { describe, expect, test } from "vitest";

import {
  type AppState,
  type ExtensionSession,
  FIXTURE_DOC_URL,
  FIXTURE_SHEET_URL,
  getEdition,
  insertFixture,
  installRecorder,
  readRecorded,
  serveFixture,
  setAppState,
  waitForClicks,
  waitForEnters,
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

      await insertFixture(page, "docs-editor");
      await waitForEnters(page, 1);

      const recorded = await readRecorded(page);
      expect(recorded.enters).toEqual(["140%"]);
      expect(recorded.clicks).toEqual([]);
      expect(await page.inputValue("#zoomSelect input")).toBe("140%");
    })
  );

  test.skipIf(edition === "extended")(
    "Docs ignores a custom zoom: it neither clicks nor types",
    () =>
      withExtension("docs-custom-base", async (session) => {
        await setAppState(session.serviceWorker, "docs", state("140%"));
        const page = await openPage(session, FIXTURE_DOC_URL);

        await insertFixture(page, "docs-editor");
        await page.waitForTimeout(2000);

        expect(await readRecorded(page)).toEqual({ clicks: [], enters: [] });
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

      // the content script only watches #docs-toolbar itself (no subtree), so the toolbar has to mutate too
      await page.evaluate(() => {
        document
          .querySelector("#zoomSelect")
          ?.classList.remove("goog-toolbar-combo-button-disabled");
        document.querySelector("#docs-toolbar")?.setAttribute("data-e2e-ready", "true");
      });
      await waitForClicks(page, 1);

      expect((await readRecorded(page)).clicks).toEqual(["150%"]);
    }));
});
