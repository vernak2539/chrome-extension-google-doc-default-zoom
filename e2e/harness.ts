/// <reference types="node" />
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { type BrowserContext, chromium, type Page, type Worker } from "playwright";

import { FIXTURES_DIR, RESULTS_DIR } from "./targets";

export interface RecordedEvents {
  // text of the first child of every menu row that received a click
  clicks: string[];
  // value of the focused input whenever Enter was pressed
  enters: string[];
  // id of the zoom control (#zoomSelect or #t-zoom) each time it was clicked: proof the content script ran
  controlClicks: string[];
  // tag name of the target of every mousedown outside the zoom control and its menu: what Google's menu treats as an outside click
  dismissals: string[];
}

// One chrome.storage call that writes, made by an extension page
export interface StorageWrite {
  area: "sync" | "local";
  method: "set" | "remove" | "clear";
  // the first argument: the items for `set`, the keys for `remove`
  arg: unknown;
}

declare global {
  interface Window {
    __e2e: RecordedEvents;
    __e2eStorageWrites: StorageWrite[];
  }
}

export interface AppState {
  zoomValue: string;
  viewOnly: boolean;
  classroomSupport: boolean;
}

export type Edition = "extended" | "base";

const EMPTY_PAGE = "<!doctype html><html><head><title>fixture</title></head><body></body></html>";
// the content script starts watching the DOM once the page is idle
const FIXTURE_INSERT_DELAY_MS = 500;
const SENTRY_INGEST_DSN = /https?:\/\/[0-9a-f]+@[^\s"'/]*sentry\.io/i;

export const FIXTURE_DOC_URL = "https://docs.google.com/document/d/e2e-fixture/edit";
export const FIXTURE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e2e-fixture/edit";

// Set per Vitest project in e2e/vitest.config.ts
const getExpectedEdition = (): Edition => {
  const edition = process.env.E2E_EDITION;

  if (edition !== "base" && edition !== "extended") {
    throw new Error(`E2E_EDITION must be "base" or "extended", got ${JSON.stringify(edition)}`);
  }

  return edition;
};

export const getBuildDir = (): string => {
  const edition = getExpectedEdition();
  const buildDir = path.resolve(process.env.E2E_EXTENSION_DIR ?? `build/chrome-mv3-${edition}`);

  if (!existsSync(path.join(buildDir, "manifest.json"))) {
    throw new Error(
      `No extension build in ${buildDir}: run \`pnpm build:${edition} -b chrome\` first`
    );
  }

  return buildDir;
};

// The edition of the build itself, checked against the one this run expects
export const getEdition = (): Edition => {
  const expected = getExpectedEdition();
  const buildDir = getBuildDir();
  const manifest = JSON.parse(readFileSync(path.join(buildDir, "manifest.json"), "utf8"));
  const built: Edition = manifest.name === "__MSG_extensionNameExtended__" ? "extended" : "base";

  if (built !== expected) {
    throw new Error(`${buildDir} holds the ${built} edition, but this run tests ${expected}`);
  }

  return built;
};

const listJavaScriptFiles = (directory: string): string[] =>
  readdirSync(directory).flatMap((entry) => {
    const entryPath = path.join(directory, entry);
    if (statSync(entryPath).isDirectory()) {
      return listJavaScriptFiles(entryPath);
    }
    return entry.endsWith(".js") ? [entryPath] : [];
  });

// Test runs must never report to the real Sentry project
export const assertNoSentryDsn = () => {
  const buildWithDsn = listJavaScriptFiles(getBuildDir()).find((file) =>
    SENTRY_INGEST_DSN.test(readFileSync(file, "utf8"))
  );

  if (buildWithDsn) {
    throw new Error(`${buildWithDsn} contains a Sentry DSN: rebuild without WXT_SENTRY_DSN set`);
  }
};

const waitForServiceWorker = async (context: BrowserContext): Promise<Worker> =>
  context.serviceWorkers()[0] ?? (await context.waitForEvent("serviceworker"));

export const launchExtension = async (userDataDir: string, { language }: LaunchOptions = {}) => {
  const buildDir = getBuildDir();
  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: "chromium",
    headless: true,
    args: [
      `--disable-extensions-except=${buildDir}`,
      `--load-extension=${buildDir}`,
      `--lang=${language ?? "en-US"}`
    ],
    ...(language && { env: { ...process.env, LANGUAGE: language } })
  });

  await context.route(/^https?:\/\/[^/]*sentry\.io\//, (route) => route.abort());

  return { context, serviceWorker: await waitForServiceWorker(context) };
};

export const setAppState = async (
  serviceWorker: Worker,
  storageKey: "docs" | "sheets",
  state: AppState
) => {
  await serviceWorker.evaluate(
    ({ key, value }) => chrome.storage.sync.set({ [key]: value, schemaVersion: 2 }),
    { key: storageKey, value: state }
  );
};

// What the Plasmo versions left behind: JSON text and schemaVersion "2"
export const setLegacyAppState = async (
  serviceWorker: Worker,
  storageKey: "docs" | "sheets",
  state: AppState
) => {
  await serviceWorker.evaluate(
    ({ key, value }) => chrome.storage.sync.set({ [key]: value, schemaVersion: "2" }),
    { key: storageKey, value: JSON.stringify(state) }
  );
};

// Observes the page's events from the main world. It does not model what Google does with them.
export const installRecorder = async (context: BrowserContext) => {
  await context.addInitScript(() => {
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
};

export const readRecorded = (page: Page): Promise<RecordedEvents> =>
  page.evaluate(() => ({
    clicks: [...window.__e2e.clicks],
    enters: [...window.__e2e.enters],
    controlClicks: [...window.__e2e.controlClicks],
    dismissals: [...window.__e2e.dismissals]
  }));

// Records every chrome.storage write made by an extension page, such as the popup. WXT storage looks
// the method up on each call, so wrapping it before the page's own scripts run catches every write.
// Count calls, not chrome.storage.onChanged events: Chrome sends none when a value is rewritten unchanged.
export const installStorageRecorder = async (context: BrowserContext) => {
  await context.addInitScript(() => {
    if (location.protocol !== "chrome-extension:") {
      return;
    }

    const writes: StorageWrite[] = [];
    window.__e2eStorageWrites = writes;

    for (const area of ["sync", "local"] as const) {
      const storageArea = chrome.storage[area] as unknown as Record<
        StorageWrite["method"],
        (...args: unknown[]) => unknown
      >;
      for (const method of ["set", "remove", "clear"] as const) {
        const original = storageArea[method].bind(storageArea);
        storageArea[method] = (...args) => {
          writes.push({ area, method, arg: structuredClone(args[0] ?? null) });
          return original(...args);
        };
      }
    }
  });
};

export const readStorageWrites = (page: Page): Promise<StorageWrite[]> =>
  page.evaluate(() => [...window.__e2eStorageWrites]);

export const waitForStorageWrites = (page: Page, count: number) =>
  page.waitForFunction((expected) => window.__e2eStorageWrites.length >= expected, count, {
    timeout: 15_000
  });

// The zoom dropdown in one app's row of the popup
export const popupZoomSelect = (popup: Page, appName: "Docs" | "Sheets") =>
  popup
    .locator("li")
    .filter({ has: popup.getByText(appName, { exact: true }) })
    .locator("select");

// Opens the popup as a tab. Each app's row renders nothing until its saved state has been read, so
// once both dropdowns are shown the popup has finished opening.
export const openPopup = async ({ context, serviceWorker }: ExtensionSession) => {
  const extensionId = new URL(serviceWorker.url()).host;
  const popup = await context.newPage();

  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await popupZoomSelect(popup, "Docs").waitFor();
  await popupZoomSelect(popup, "Sheets").waitFor();

  return popup;
};

// Serves an empty page for docs.google.com and blocks every other http(s) request. The filter is on the
// protocol because a catch-all route would also block the extension's own files.
export const serveFixture = async (context: BrowserContext) => {
  await context.route(
    (url) => url.protocol === "http:" || url.protocol === "https:",
    (route) =>
      new URL(route.request().url()).hostname === "docs.google.com"
        ? route.fulfill({ contentType: "text/html", body: EMPTY_PAGE })
        : route.abort()
  );
};

interface InsertOptions {
  // the page is still loading: Docs disables the zoom control until it is ready
  zoomControlDisabled?: boolean;
}

// Inserting is a DOM mutation, which is what makes `onElementAvailable` fire in the content script
export const insertFixture = async (page: Page, name: string, options: InsertOptions = {}) => {
  const html = await readFile(path.join(FIXTURES_DIR, `${name}.html`), "utf8");

  await page.waitForTimeout(FIXTURE_INSERT_DELAY_MS);
  await page.evaluate(
    ({ markup, disableZoomControl }) => {
      const template = document.createElement("template");
      template.innerHTML = markup;
      if (disableZoomControl) {
        template.content
          .querySelector("#zoomSelect, #t-zoom")
          ?.classList.add("goog-toolbar-combo-button-disabled");
      }
      document.body.append(template.content);
    },
    { markup: html, disableZoomControl: options.zoomControlDisabled ?? false }
  );
};

export const waitForClicks = (page: Page, count: number) =>
  page.waitForFunction((expected) => window.__e2e.clicks.length >= expected, count, {
    timeout: 15_000
  });

export const waitForControlClicks = (page: Page, count: number) =>
  page.waitForFunction((expected) => window.__e2e.controlClicks.length >= expected, count, {
    timeout: 15_000
  });

export const waitForDismissals = (page: Page, count: number) =>
  page.waitForFunction((expected) => window.__e2e.dismissals.length >= expected, count, {
    timeout: 15_000
  });

export const waitForEnters = (page: Page, count: number) =>
  page.waitForFunction((expected) => window.__e2e.enters.length >= expected, count, {
    timeout: 15_000
  });

// Opens `url` in a page that does not have focus, like a background tab or the selected tab of a window that is not
// focused. Chrome fires no focus events there, so Google ignores a typed zoom (#77).
// Playwright makes every page act as if it had focus ("focus emulation"), which would hide that. This turns it off for
// the page and opens another page in front. Playwright turns it back on when the page navigates to another site, so it
// is turned off again once the navigation commits, before the page has a zoom control for the content script to use.
// `page.bringToFront()` gives the page focus, as selecting the tab does.
export const openUnfocusedPage = async (context: BrowserContext, url: string): Promise<Page> => {
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  const disableFocusEmulation = () =>
    cdp.send("Emulation.setFocusEmulationEnabled", { enabled: false });

  await disableFocusEmulation();
  await context.newPage();
  await page.goto(url, { waitUntil: "commit" });
  await disableFocusEmulation();
  await page.waitForLoadState("load");

  // a page with focus would make the test prove nothing
  if (await page.evaluate(() => document.hasFocus())) {
    throw new Error("The page has focus: Playwright's focus emulation is still on");
  }

  return page;
};

export const hasFocus = (page: Page): Promise<boolean> => page.evaluate(() => document.hasFocus());

// Where the page ended up, without the query string (a sign-in URL carries the document URL)
// Takes a Playwright or a Puppeteer page
export const describeLocation = (page: Pick<Page, "url">): string => {
  const { hostname, pathname } = new URL(page.url());
  const location = `${hostname}${pathname}`;

  return hostname === "accounts.google.com"
    ? `the page went to Google sign-in (${location}), so the document is not shared publicly`
    : `the page is at ${location}`;
};

export const findSelectors = (page: Page, selectors: string[]): Promise<string[]> =>
  page.evaluate(
    (candidates) => candidates.filter((selector) => document.querySelector(selector)),
    selectors
  );

const saveScreenshot = async (page: Page | undefined, testName: string) => {
  if (!page) {
    return;
  }

  await mkdir(path.join(RESULTS_DIR, "screenshots"), { recursive: true });
  // Both editions run the same test names into the same directory
  const fileName = `${getEdition()}-${testName.replace(/[^a-z0-9]+/gi, "-")}.png`;
  await page
    .screenshot({ path: path.join(RESULTS_DIR, "screenshots", fileName) })
    .catch(() => undefined);
};

export interface ExtensionSession {
  context: BrowserContext;
  serviceWorker: Worker;
}

export interface LaunchOptions {
  // Browser UI language, e.g. "fa". Chromium on Linux takes it from LANGUAGE: `--lang` alone leaves
  // chrome.i18n.getUILanguage() at the system language. macOS ignores both.
  language?: string;
}

// Runs `run` against the built extension in a fresh browser, and keeps a screenshot of the last page,
// whether the test passed or failed: CI uploads them so a reviewer can see what each test saw
export const withExtension = async (
  testName: string,
  run: (session: ExtensionSession) => Promise<void>,
  options: LaunchOptions = {}
) => {
  assertNoSentryDsn();

  const userDataDir = await mkdtemp(path.join(tmpdir(), "zoom-e2e-"));
  const session = await launchExtension(userDataDir, options);

  try {
    await run(session);
    await saveScreenshot(session.context.pages().at(-1), testName);
  } catch (error) {
    await saveScreenshot(session.context.pages().at(-1), testName);
    throw error;
  } finally {
    await session.context.close();
    await rm(userDataDir, { recursive: true, force: true });
  }
};

// A plain browser without the extension, for capturing pages
export const withPublicPage = async (testName: string, run: (page: Page) => Promise<void>) => {
  const browser = await chromium.launch({ channel: "chromium", headless: true });

  try {
    const context = await browser.newContext({ locale: "en-US" });
    const page = await context.newPage();

    try {
      await run(page);
    } catch (error) {
      await saveScreenshot(page, testName);
      throw error;
    }
  } finally {
    await browser.close();
  }
};
