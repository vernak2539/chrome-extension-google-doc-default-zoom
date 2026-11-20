/// <reference types="node" />
// The zoom flow in Firefox on the live Docs and Sheets pages, signed out (docs/e2e.md). It loads
// build/firefox-mv2-base through e2e/firefox-harness.ts and follows e2e/zoom-live.e2e.ts.
import type { Browser, Page } from "puppeteer-core";
import { beforeAll, describe, test } from "vitest";

import {
  assertFirefoxBuild,
  blockSentry,
  installRecorder,
  setAppState,
  withFirefox
} from "./firefox-harness";
import { describeLocation } from "./harness";
import { LIVE_DOC_URL, LIVE_PAGE_SELECTORS, LIVE_SHEET_URL } from "./targets";

const PAGE_TIMEOUT_MS = 30_000;

beforeAll(assertFirefoxBuild);

const describeFoundSelectors = async (page: Page) => {
  const found = await page.evaluate(
    (candidates) => candidates.filter((selector) => document.querySelector(selector)),
    LIVE_PAGE_SELECTORS
  );
  return `${describeLocation(page)}; selectors found on the page: ${found.join(", ") || "none"}`;
};

const openLivePage = async (firefox: Browser, url: string) => {
  const page = await firefox.newPage();
  await blockSentry(page);
  await installRecorder(page);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: PAGE_TIMEOUT_MS });
  return page;
};

const waitForChrome = async (page: Page) => {
  try {
    await page.waitForSelector("#docs-chrome", { timeout: PAGE_TIMEOUT_MS });
  } catch (error) {
    throw new Error(
      `#docs-chrome never appeared (blocked, sign-in wall or markup change); ${await describeFoundSelectors(page)}`,
      { cause: error }
    );
  }
};

// Waits for a click on a row that holds the whole zoom value ("50%" must not stand in for "150%")
const waitForZoomClick = async (page: Page, zoomValue: string) => {
  try {
    await page.waitForFunction(
      (pattern: string) => new RegExp(pattern).test(window.__e2e.clicks.at(-1) ?? ""),
      { timeout: PAGE_TIMEOUT_MS },
      `(^|\\D)${zoomValue}(\\D|$)`
    );
  } catch (error) {
    throw new Error(`no zoom row click for ${zoomValue}; ${await describeFoundSelectors(page)}`, {
      cause: error
    });
  }
};

const expectZoomBoxValue = async (page: Page, selector: string, zoomValue: string) => {
  if (!(await page.$(selector))) {
    return;
  }

  try {
    await page.waitForFunction(
      (target: string, expected: string) =>
        document.querySelector<HTMLInputElement>(target)?.value === expected,
      { timeout: PAGE_TIMEOUT_MS },
      selector,
      zoomValue
    );
  } catch (error) {
    const value = await page.$eval(selector, (input) => (input as HTMLInputElement).value);
    throw new Error(`${selector} shows ${JSON.stringify(value)}, not ${zoomValue}`, {
      cause: error
    });
  }
};

// These open the maintainer's public documents signed out. Nothing here signs in to Google.
describe("zoom flow in Firefox on the live Docs and Sheets pages (base edition)", () => {
  test("Docs applies 150%", () =>
    withFirefox("live-docs", async (firefox) => {
      // viewOnly is on so that the view-only flow runs when the signed-out page has no zoom box
      await setAppState(firefox, "docs", {
        zoomValue: "150%",
        viewOnly: true,
        classroomSupport: false
      });
      const page = await openLivePage(firefox, LIVE_DOC_URL);

      await waitForChrome(page);
      await waitForZoomClick(page, "150%");
      await expectZoomBoxValue(page, "#zoomSelect input", "150%");
    }));

  test("Sheets applies 125%", () =>
    withFirefox("live-sheets", async (firefox) => {
      await setAppState(firefox, "sheets", {
        zoomValue: "125%",
        viewOnly: false,
        classroomSupport: false
      });
      const page = await openLivePage(firefox, LIVE_SHEET_URL);

      await waitForChrome(page);
      await waitForZoomClick(page, "125%");
      await expectZoomBoxValue(page, "#t-zoom input", "125%");
    }));
});
