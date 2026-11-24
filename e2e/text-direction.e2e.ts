/// <reference types="node" />
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import type { Locator } from "playwright";
import { describe, expect, test } from "vitest";

import { ANNOUNCEMENT_URL } from "../src/utils/announcement";
import {
  type ExtensionSession,
  getEdition,
  openPopup,
  serveFixture,
  withExtension
} from "./harness";

const edition = getEdition();

const LOCALES_DIR = path.resolve("public/_locales");

const readMessage = (locale: string, key: string): string =>
  JSON.parse(readFileSync(path.join(LOCALES_DIR, locale, "messages.json"), "utf8"))[key].message;

const NAME_KEY = edition === "extended" ? "extensionNameExtended" : "extensionName";

const extensionPageUrl = ({ serviceWorker }: ExtensionSession, file: string) =>
  `chrome-extension://${new URL(serviceWorker.url()).host}/${file}`;

// The used value of a logical property, resolved for the page's direction
const computed = (locator: Locator, property: string) =>
  locator.evaluate((el, name) => getComputedStyle(el).getPropertyValue(name), property);

describe(`extension pages lay out by language (${edition} edition)`, () => {
  test("the English popup lays out left-to-right", async () => {
    await withExtension("direction-popup-en", async (session) => {
      await serveFixture(session.context);
      // Registered after serveFixture, so it wins: its abort never reaches this URL
      await session.context.route(ANNOUNCEMENT_URL, (route) =>
        route.fulfill({
          contentType: "application/json",
          body: JSON.stringify([
            {
              id: "e2e-direction",
              active: true,
              dismissible: false,
              messages: { en: "E2E announcement" }
            }
          ])
        })
      );

      const popup = await openPopup(session);

      expect(await popup.evaluate(() => document.documentElement.dir)).toBe("ltr");

      const home = popup.getByRole("link", { name: "Home" });
      const settings = popup.getByRole("link", { name: "Settings" });
      const homeBox = await home.boundingBox();
      const settingsBox = await settings.boundingBox();

      // Home sits left of Settings
      expect(homeBox!.x + homeBox!.width).toBeLessThanOrEqual(settingsBox!.x);
      // .tabLink's margin-inline-end resolves to the right in LTR
      expect(await computed(home, "margin-right")).toBe("10px");

      const label = popup
        .locator("label")
        .filter({ has: popup.locator('input[type="checkbox"]') })
        .first();
      const box = label.locator('input[type="checkbox"]');
      const text = label.locator("span").first();
      const boxRect = await box.boundingBox();
      const textRect = await text.boundingBox();

      // The checkbox sits left of its label
      expect(boxRect!.x + boxRect!.width).toBeLessThanOrEqual(textRect!.x);
      expect(await computed(box, "margin-right")).toBe("10px");
      expect(await computed(box, "margin-left")).toBe("0px");

      const announcement = popup.getByRole("status");
      await announcement.waitFor();

      // The 4px accent border is on the left
      expect(await computed(announcement, "border-left-width")).toBe("4px");
      expect(await computed(announcement, "border-right-width")).toBe("1px");
    });
  });

  test("the English versions page indents its lists from the left", async () => {
    await withExtension("direction-versions-en", async (session) => {
      await serveFixture(session.context);

      const page = await session.context.newPage();
      await page.goto(extensionPageUrl(session, "ext-versions.html"));

      // The first list is a CheckList, and the page has no other list before it
      const list = page.locator("ul").first();
      await list.waitFor();

      expect(await page.evaluate(() => document.documentElement.dir)).toBe("ltr");
      expect(await computed(list, "padding-left")).toBe("15px");
      expect(await computed(list, "padding-right")).toBe("0px");

      await page.goto(extensionPageUrl(session, "experimental-features.html"));
      await page.waitForLoadState("load");

      expect(await page.evaluate(() => document.documentElement.dir)).toBe("ltr");
    });
  });

  // Only Chromium on Linux takes its UI language from LANGUAGE. macOS ignores it.
  test.runIf(process.platform === "linux").each(["ar", "he", "fa"])(
    "a %s browser uses the direction of the locale it gets",
    async (language) => {
      await withExtension(
        `direction-popup-${language}`,
        async (session) => {
          const shipped = existsSync(path.join(LOCALES_DIR, language, "messages.json"));

          const uiLanguage = await session.serviceWorker.evaluate(() =>
            chrome.i18n.getUILanguage()
          );
          expect(uiLanguage, `Chromium did not start in ${language}`).toMatch(
            new RegExp(`^${language}`)
          );

          await serveFixture(session.context);
          const popup = await openPopup(session);

          expect(await popup.evaluate(() => document.documentElement.dir)).toBe(
            shipped ? "rtl" : "ltr"
          );
          // Which strings the direction belongs to
          expect((await popup.locator("h1").textContent())?.trim()).toBe(
            readMessage(shipped ? language : "en", NAME_KEY)
          );
        },
        { language }
      );
    }
  );
});
