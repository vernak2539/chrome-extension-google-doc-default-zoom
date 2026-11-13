import type { BrowserOptions } from "@sentry/browser";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createSentryClient } from "./base";

vi.mock("@plasmohq/storage", () => ({
  Storage: class {
    get = async () => undefined;
  }
}));

type Envelope = Parameters<ReturnType<NonNullable<BrowserOptions["transport"]>>["send"]>[0];

const REFERRER = "https://docs.google.com/document/d/REFERRER_ID/edit";

const cases = [
  {
    name: "a Docs URL",
    href: "https://docs.google.com/document/d/DOC_ID_123/edit",
    expected: "https://docs.google.com/document/[redacted]"
  },
  {
    name: "a Sheets URL",
    href: "https://docs.google.com/spreadsheets/d/SHEET_ID_123/edit#gid=0",
    expected: "https://docs.google.com/spreadsheets/[redacted]"
  },
  {
    name: "a /u/1/ URL",
    href: "https://docs.google.com/document/u/1/d/DOC_ID_123/edit",
    expected: "https://docs.google.com/document/[redacted]"
  },
  {
    name: "a URL with resourcekey, usp and a fragment",
    href: "https://docs.google.com/document/d/DOC_ID_123/edit?usp=sharing&resourcekey=0-KEY_123#heading=h.abc",
    expected: "https://docs.google.com/document/[redacted]"
  }
];

const captureEvent = async (href: string) => {
  vi.stubGlobal("chrome", { i18n: { getUILanguage: () => "en" } });
  vi.stubGlobal("location", { href });
  vi.stubGlobal("document", {
    location: { href },
    referrer: REFERRER,
    visibilityState: "visible",
    addEventListener() {},
    removeEventListener() {}
  });

  const envelopes: Envelope[] = [];
  const scope = createSentryClient("content", {
    dsn: "https://public@example.invalid/1",
    transport: () => ({
      send: async (envelope: Envelope) => {
        envelopes.push(envelope);
        return {};
      },
      flush: async () => true
    })
  });

  scope.captureException(new Error("boom"));
  await scope.getClient()!.flush(1000);

  const items = envelopes.flatMap((envelope) => [...envelope[1]]);
  const eventItem = items.find(([header]) => header.type === "event");
  return eventItem![1] as { request?: { url?: string; headers?: Record<string, string> } };
};

describe("createSentryClient", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe.each(cases)("on $name", ({ href, expected }) => {
    test("should send the redacted url", async () => {
      const event = await captureEvent(href);

      expect(event.request?.url).toBe(expected);
    });

    test("should not send a referrer", async () => {
      const event = await captureEvent(href);
      const headerNames = Object.keys(event.request?.headers ?? {}).map((name) =>
        name.toLowerCase()
      );

      expect(headerNames).not.toContain("referer");
    });

    test("should not leak document ids, keys, query or fragment anywhere in the event", async () => {
      const event = await captureEvent(href);
      const serialized = JSON.stringify(event);

      for (const leak of [
        "DOC_ID_123",
        "SHEET_ID_123",
        "REFERRER_ID",
        "resourcekey",
        "KEY_123",
        "usp=",
        "#heading",
        "#gid"
      ]) {
        expect(serialized).not.toContain(leak);
      }
      expect(event.request?.url).not.toContain("?");
    });
  });
});
