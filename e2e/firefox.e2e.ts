/// <reference types="node" />
// The zoom flow in Firefox, against the saved Docs and Sheets markup (docs/e2e.md). Firefox only ships the Base
// edition, so this loads build/firefox-mv2-base through e2e/firefox-harness.ts. The fixture insert and the
// checks follow e2e/harness.ts and e2e/zoom-fixtures.e2e.ts.
import { readFile } from "node:fs/promises";
import path from "node:path";

import type { Browser, Page } from "puppeteer-core";
import { beforeAll, describe, expect, test } from "vitest";

import {
  assertFirefoxBuild,
  installRecorder,
  readRecorded,
  serveFixture,
  setAppState,
  waitForRecorded,
  withFirefox
} from "./firefox-harness";
import type { AppState } from "./harness";
import { FIXTURES_DIR } from "./targets";

const DOC_URL = "https://docs.google.com/document/d/e2e-fixture/edit";
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e2e-fixture/edit";
// the content script starts watching the DOM once the page is idle
const FIXTURE_INSERT_DELAY_MS = 500;

beforeAll(assertFirefoxBuild);

const openPage = async (firefox: Browser, url: string) => {
  const page = await firefox.newPage();
  await serveFixture(page);
  await installRecorder(page);
  await page.goto(url);
  return page;
};

// Inserting is a DOM mutation, which is what makes `onElementAvailable` fire in the content script
const insertFixture = async (page: Page, name: string, zoomControlDisabled = false) => {
  const html = await readFile(path.join(FIXTURES_DIR, `${name}.html`), "utf8");

  await new Promise((resolve) => setTimeout(resolve, FIXTURE_INSERT_DELAY_MS));
  await page.evaluate(
    (markup, disableZoomControl) => {
      const template = document.createElement("template");
      template.innerHTML = markup;
      if (disableZoomControl) {
        template.content
          .querySelector("#zoomSelect, #t-zoom")
          ?.classList.add("goog-toolbar-combo-button-disabled");
      }
      document.body.append(template.content);
    },
    html,
    zoomControlDisabled
  );
};

const state = (zoomValue: string, viewOnly = false): AppState => ({
  zoomValue,
  viewOnly,
  classroomSupport: false
});

describe("zoom flow in Firefox against saved Docs and Sheets markup (base edition)", () => {
  test("Docs applies a preset zoom by clicking its menu row", () =>
    withFirefox("docs-preset", async (firefox) => {
      await setAppState(firefox, "docs", state("150%"));
      const page = await openPage(firefox, DOC_URL);

      await insertFixture(page, "docs-editor");
      await waitForRecorded(page, "clicks", 1);

      expect((await readRecorded(page)).clicks).toEqual(["150%"]);
    }));

  test("Sheets applies a preset zoom by clicking its menu row", () =>
    withFirefox("sheets-preset", async (firefox) => {
      await setAppState(firefox, "sheets", state("125%"));
      const page = await openPage(firefox, SHEET_URL);

      await insertFixture(page, "sheets-editor");
      await waitForRecorded(page, "clicks", 1);

      expect((await readRecorded(page)).clicks).toEqual(["125%"]);
    }));

  test("Docs opens the zoom menu for a custom zoom but selects no row and types nothing", () =>
    withFirefox("docs-custom-base", async (firefox) => {
      await setAppState(firefox, "docs", state("140%"));
      const page = await openPage(firefox, DOC_URL);

      await insertFixture(page, "docs-editor");
      // the content script ran: it opened the zoom menu, found no "140%" row and gave up
      await waitForRecorded(page, "controlClicks", 1);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const recorded = await readRecorded(page);
      expect(recorded.controlClicks).toEqual(["zoomSelect"]);
      expect(recorded.clicks).toEqual([]);
      expect(recorded.enters).toEqual([]);
      // the input was never focused, so the flow closes the menu it opened with an outside press on body
      expect(recorded.dismissals).toEqual(["body"]);
    }));

  test("Docs view-only opens View > Zoom and clicks the zoom row", () =>
    withFirefox("docs-view-only", async (firefox) => {
      await setAppState(firefox, "docs", state("150%", true));
      const page = await openPage(firefox, DOC_URL);

      await insertFixture(page, "docs-view-only");
      // the flow waits one second for the View menu to open
      await waitForRecorded(page, "clicks", 2);

      const { clicks } = await readRecorded(page);
      expect(clicks).toHaveLength(2);
      expect(clicks[0]).toMatch(/^Zoom/);
      // the whole value, so "50%" can never stand in for "150%"
      expect(clicks[1]).toMatch(/(^|\D)150%(\D|$)/);
    }));

  test("Docs waits while the zoom control is disabled, then applies the zoom", () =>
    withFirefox("docs-page-loading", async (firefox) => {
      await setAppState(firefox, "docs", state("150%"));
      const page = await openPage(firefox, DOC_URL);

      await insertFixture(page, "docs-editor", true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      expect((await readRecorded(page)).clicks).toEqual([]);

      // only the class of the zoom control changes, which is a descendant of the watched toolbar
      await page.evaluate(() => {
        document
          .querySelector("#zoomSelect")
          ?.classList.remove("goog-toolbar-combo-button-disabled");
      });
      await waitForRecorded(page, "clicks", 1);

      expect((await readRecorded(page)).clicks).toEqual(["150%"]);
    }));
});
