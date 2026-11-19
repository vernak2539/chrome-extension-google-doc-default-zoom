/// <reference types="node" />
// The zoom flow in Firefox, against the saved Docs and Sheets markup (docs/e2e.md). Firefox only ships the Base
// edition, so this loads build/firefox-mv2-base. Playwright can't load an extension into Firefox, so this file
// drives Firefox with Puppeteer over WebDriver BiDi and does not use e2e/harness.ts. The recorder, the fixture
// insert and the checks follow e2e/harness.ts and e2e/zoom-fixtures.e2e.ts.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";

import puppeteer, { type Browser, type Page, TimeoutError } from "puppeteer-core";
import { beforeAll, describe, expect, test } from "vitest";

import type { AppState, RecordedEvents } from "./harness";
import { FIXTURES_DIR, RESULTS_DIR } from "./targets";

// Firefox's promise-based extension API. `chrome.*` in Firefox MV2 takes callbacks and returns undefined.
declare const browser: typeof chrome;

const BUILD_DIR = path.resolve(process.env.E2E_EXTENSION_DIR ?? "build/firefox-mv2-base");
// Firefox gives each install a random moz-extension:// host. The `extensions.webextensions.uuids` pref pins it.
const EXTENSION_UUID = "6a4a1d0e-0000-4000-8000-00000000e2e0";
const POPUP_URL = `moz-extension://${EXTENSION_UUID}/popup.html`;
const DOC_URL = "https://docs.google.com/document/d/e2e-fixture/edit";
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e2e-fixture/edit";
const EMPTY_PAGE = "<!doctype html><html><head><title>fixture</title></head><body></body></html>";
const SENTRY_INGEST_DSN = /https?:\/\/[0-9a-f]+@[^\s"'/]*sentry\.io/i;
// the content script starts watching the DOM once the page is idle
const FIXTURE_INSERT_DELAY_MS = 500;
const WAIT_TIMEOUT_MS = 15_000;

const readManifest = () => JSON.parse(readFileSync(path.join(BUILD_DIR, "manifest.json"), "utf8"));

beforeAll(() => {
  if (!process.env.FIREFOX_BIN) {
    throw new Error(
      "Set FIREFOX_BIN to a Firefox binary: `pnpm exec browsers install firefox@stable` prints its path"
    );
  }
  if (!existsSync(path.join(BUILD_DIR, "manifest.json"))) {
    throw new Error(
      `No extension build in ${BUILD_DIR}: run \`pnpm build:base --target=firefox-mv2\` first`
    );
  }
  if (readManifest().permissions?.includes("debugger")) {
    throw new Error(`${BUILD_DIR} holds the Extended edition, but Firefox only ships Base`);
  }
  // Test runs must never report to the real Sentry project. The background page's requests can't be routed
  // from here, so this check is the only guard for them.
  const buildWithDsn = readdirSync(BUILD_DIR, { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(".js"))
    .find((file) => SENTRY_INGEST_DSN.test(readFileSync(path.join(BUILD_DIR, file), "utf8")));
  if (buildWithDsn) {
    throw new Error(
      `${buildWithDsn} contains a Sentry DSN: rebuild without PLASMO_PUBLIC_SENTRY_DSN set`
    );
  }
});

// Serves an empty page for docs.google.com and blocks every other http(s) request. Other protocols
// (moz-extension:, data:) go through, so the extension's own files still load.
const serveFixture = async (page: Page) => {
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    const { protocol, hostname } = new URL(request.url());
    if (protocol !== "http:" && protocol !== "https:") {
      void request.continue();
    } else if (hostname === "docs.google.com") {
      void request.respond({ status: 200, contentType: "text/html", body: EMPTY_PAGE });
    } else {
      void request.abort();
    }
  });
};

// Settings are written from the popup page, as the popup would. Firefox MV2 has a background page, not a
// service worker, and Puppeteer doesn't expose it.
const setAppState = async (firefox: Browser, storageKey: "docs" | "sheets", state: AppState) => {
  const popup = await firefox.newPage();
  await serveFixture(popup);
  // The popup loads, but Puppeteer misses the end of the navigation when the tab moves to the extension
  // process, so wait for the extension API instead
  await popup.goto(POPUP_URL, { timeout: 1000 }).catch((error) => {
    if (!(error instanceof TimeoutError)) {
      throw error;
    }
  });
  await popup.waitForFunction(() => typeof browser !== "undefined" && !!browser.storage?.sync, {
    timeout: WAIT_TIMEOUT_MS
  });
  // @plasmohq/storage keeps every value JSON encoded
  await popup.evaluate(
    (key, value) => browser.storage.sync.set({ [key]: value, schemaVersion: "2" }),
    storageKey,
    JSON.stringify(state)
  );
  await popup.close();
};

// Observes the page's events from the main world, like installRecorder in e2e/harness.ts
const installRecorder = (page: Page) =>
  page.evaluateOnNewDocument(() => {
    const recorded: RecordedEvents = { clicks: [], enters: [], controlClicks: [] };
    window.__e2e = recorded;

    document.addEventListener(
      "click",
      (event) => {
        const target = event.target as Element | null;
        const row = target?.closest?.(".goog-menuitem");
        if (row) {
          recorded.clicks.push(row.firstChild?.textContent ?? "");
        }
        const control = target?.closest?.("#zoomSelect, #t-zoom");
        if (control) {
          recorded.controlClicks.push(control.id);
        }
      },
      true
    );

    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Enter") {
          recorded.enters.push((event.target as HTMLInputElement).value ?? "");
        }
      },
      true
    );
  });

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

const readRecorded = (page: Page): Promise<RecordedEvents> =>
  page.evaluate(() => ({
    clicks: [...window.__e2e.clicks],
    enters: [...window.__e2e.enters],
    controlClicks: [...window.__e2e.controlClicks]
  }));

const waitForRecorded = (page: Page, kind: keyof RecordedEvents, count: number) =>
  page.waitForFunction(
    (key: keyof RecordedEvents, expected: number) => window.__e2e[key].length >= expected,
    { timeout: WAIT_TIMEOUT_MS },
    kind,
    count
  );

const saveScreenshot = async (firefox: Browser, testName: string) => {
  const page = (await firefox.pages()).at(-1);
  if (!page) {
    return;
  }

  await mkdir(path.join(RESULTS_DIR, "screenshots"), { recursive: true });
  await page
    .screenshot({ path: path.join(RESULTS_DIR, "screenshots", `firefox-${testName}.png`) })
    .catch(() => undefined);
};

// Runs `run` against the built extension in a fresh Firefox profile, and keeps a screenshot when it fails
const withFirefox = async (testName: string, run: (firefox: Browser) => Promise<void>) => {
  const firefox = await puppeteer.launch({
    browser: "firefox",
    executablePath: process.env.FIREFOX_BIN,
    headless: true,
    enableExtensions: true,
    // WebDriver BiDi only opens http(s), file, blob and about:blank pages without it, and the popup is
    // moz-extension://. Test-only: it gives this script access to Firefox's privileged pages.
    env: { ...process.env, MOZ_REMOTE_ALLOW_SYSTEM_ACCESS: "1" },
    extraPrefsFirefox: {
      "extensions.webextensions.uuids": JSON.stringify({
        [readManifest().browser_specific_settings.gecko.id]: EXTENSION_UUID
      }),
      "intl.accept_languages": "en-US"
    }
  });

  try {
    await firefox.installExtension(BUILD_DIR);
    await run(firefox);
  } catch (error) {
    await saveScreenshot(firefox, testName);
    throw error;
  } finally {
    await firefox.close();
  }
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

      // the content script only watches #docs-toolbar itself (no subtree), so the toolbar has to mutate too
      await page.evaluate(() => {
        document
          .querySelector("#zoomSelect")
          ?.classList.remove("goog-toolbar-combo-button-disabled");
        document.querySelector("#docs-toolbar")?.setAttribute("data-e2e-ready", "true");
      });
      await waitForRecorded(page, "clicks", 1);

      expect((await readRecorded(page)).clicks).toEqual(["150%"]);
    }));
});
