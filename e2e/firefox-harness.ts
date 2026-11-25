/// <reference types="node" />
// Loads build/firefox-mv2-base into Firefox for e2e/firefox.e2e.ts (saved markup) and e2e/firefox-live.e2e.ts
// (the live pages), like e2e/harness.ts does for Chromium. Firefox only ships the Base edition. Playwright
// can't load an extension into Firefox, so this drives Firefox with Puppeteer over WebDriver BiDi.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";

import puppeteer, { type Browser, type Page, TimeoutError } from "puppeteer-core";

import type { AppState, RecordedEvents } from "./harness";
import { RESULTS_DIR } from "./targets";

// Firefox's promise-based extension API. `chrome.*` in Firefox MV2 takes callbacks and returns undefined.
declare const browser: typeof chrome;

const BUILD_DIR = path.resolve(process.env.E2E_EXTENSION_DIR ?? "build/firefox-mv2-base");
// Firefox gives each install a random moz-extension:// host. The `extensions.webextensions.uuids` pref pins it.
const EXTENSION_UUID = "6a4a1d0e-0000-4000-8000-00000000e2e0";
const POPUP_URL = `moz-extension://${EXTENSION_UUID}/popup.html`;
const EMPTY_PAGE = "<!doctype html><html><head><title>fixture</title></head><body></body></html>";
const SENTRY_INGEST_DSN = /https?:\/\/[0-9a-f]+@[^\s"'/]*sentry\.io/i;
export const WAIT_TIMEOUT_MS = 15_000;

const readManifest = () => JSON.parse(readFileSync(path.join(BUILD_DIR, "manifest.json"), "utf8"));

// Run before any test: checks there is a Firefox binary and a Base build without a Sentry DSN
export const assertFirefoxBuild = () => {
  if (!process.env.FIREFOX_BIN) {
    throw new Error(
      "Set FIREFOX_BIN to a Firefox binary: `pnpm exec browsers install firefox@stable` prints its path"
    );
  }
  if (!existsSync(path.join(BUILD_DIR, "manifest.json"))) {
    throw new Error(`No extension build in ${BUILD_DIR}: run \`pnpm build:base -b firefox\` first`);
  }
  if (readManifest().name === "__MSG_extensionNameExtended__") {
    throw new Error(`${BUILD_DIR} holds the Extended edition, but Firefox only ships Base`);
  }
  // Test runs must never report to the real Sentry project. The background page's requests can't be routed
  // from here, so this check is the only guard for them.
  const buildWithDsn = readdirSync(BUILD_DIR, { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(".js"))
    .find((file) => SENTRY_INGEST_DSN.test(readFileSync(path.join(BUILD_DIR, file), "utf8")));
  if (buildWithDsn) {
    throw new Error(`${buildWithDsn} contains a Sentry DSN: rebuild without WXT_SENTRY_DSN set`);
  }
};

// Serves an empty page for docs.google.com and blocks every other http(s) request. Other protocols
// (moz-extension:, data:) go through, so the extension's own files still load.
export const serveFixture = async (page: Page) => {
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

// Blocks requests to *.sentry.io and lets everything else through, for the live pages
export const blockSentry = async (page: Page) => {
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    const { hostname } = new URL(request.url());
    if (hostname === "sentry.io" || hostname.endsWith(".sentry.io")) {
      void request.abort();
    } else {
      void request.continue();
    }
  });
};

// Settings are written from the popup page, as the popup would. Firefox MV2 has a background page, not a
// service worker, and Puppeteer doesn't expose it.
export const setAppState = async (
  firefox: Browser,
  storageKey: "docs" | "sheets",
  state: AppState
) => {
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
  // JSON text and schemaVersion "2", the format the popup writes (see setAppState in e2e/harness.ts)
  await popup.evaluate(
    (key, value) => browser.storage.sync.set({ [key]: value, schemaVersion: "2" }),
    storageKey,
    JSON.stringify(state)
  );
  await popup.close();
};

// Observes the page's events from the main world, like installRecorder in e2e/harness.ts
export const installRecorder = (page: Page) =>
  page.evaluateOnNewDocument(() => {
    const recorded: RecordedEvents = { clicks: [], enters: [], controlClicks: [], dismissals: [] };
    window.__e2e = recorded;

    document.addEventListener(
      "mousedown",
      (event) => {
        const target = event.target as Element | null;
        if (target?.tagName && !target.closest?.("#zoomSelect, #t-zoom, .goog-menu")) {
          recorded.dismissals.push(target.tagName.toLowerCase());
        }
      },
      true
    );

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

export const readRecorded = (page: Page): Promise<RecordedEvents> =>
  page.evaluate(() => ({
    clicks: [...window.__e2e.clicks],
    enters: [...window.__e2e.enters],
    controlClicks: [...window.__e2e.controlClicks],
    dismissals: [...window.__e2e.dismissals]
  }));

export const waitForRecorded = (page: Page, kind: keyof RecordedEvents, count: number) =>
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

// Runs `run` against the built extension in a fresh Firefox profile, and keeps a screenshot of the last
// page, whether the test passed or failed: CI uploads them so a reviewer can see what each test saw
export const withFirefox = async (testName: string, run: (firefox: Browser) => Promise<void>) => {
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
    await saveScreenshot(firefox, testName);
  } catch (error) {
    await saveScreenshot(firefox, testName);
    throw error;
  } finally {
    await firefox.close();
  }
};
