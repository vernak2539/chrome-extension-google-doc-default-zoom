// Lives outside src/background/messages: Plasmo bundles every file in that folder as a message handler.
// Runs the real Sentry client against a fake DSN and records what it sends, so it checks what reaches the transport.
import type { ReportContentErrorRequestBody } from "src/types";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@plasmohq/storage", () => ({
  Storage: class {
    get = async () => undefined;
  }
}));

interface SentEvent {
  exception?: { values: { type: string; value: string; stacktrace?: { frames: any[] } }[] };
  message?: string;
  tags?: Record<string, string>;
  contexts?: Record<string, unknown>;
  extra?: Record<string, any>;
  request?: { url?: string };
  release?: string;
}

const CONTENT_URL = "chrome-extension://abcdefgh/contents.1a2b3c.js";
const DOCS_URL = "https://docs.google.com/document/d/DOC_ID_123/edit?resourcekey=KEY_123#h.abc";

const requests: string[] = [];

const baseBody: ReportContentErrorRequestBody = {
  application: "Docs",
  dom: { menu: '{"id":"docs-chrome"}', body: '{"id":"body"}' }
};

const reportAndCollectEvent = async (body: ReportContentErrorRequestBody) => {
  const { default: handler } = await import("./messages/report-content-error");
  const send = vi.fn();

  await handler({ body, sender: { url: DOCS_URL } } as any, { send } as any);
  await vi.waitFor(() => expect(requests.length).toBeGreaterThan(0));

  const eventLine = requests.pop()!.split("\n")[2];
  return { event: JSON.parse(eventLine) as SentEvent, send };
};

describe("report-content-error handler", () => {
  beforeEach(() => {
    requests.length = 0;
    vi.resetModules();
    vi.stubEnv("PLASMO_PUBLIC_SENTRY_DSN", "https://public@example.invalid/1");
    vi.stubGlobal("chrome", {
      i18n: { getUILanguage: () => "en" },
      runtime: { getManifest: () => ({ version: "1.2.3" }) }
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init: { body: string }) => {
        requests.push(init.body);
        return { status: 200, headers: new Headers(), text: async () => "" };
      })
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  test("should send a content script error with its own stack frames", async () => {
    const { event, send } = await reportAndCollectEvent({
      ...baseBody,
      error: {
        name: "TypeError",
        message: "boom",
        stack: `TypeError: boom\n    at zoomIn (${CONTENT_URL}:10:20)\n    at main (${CONTENT_URL}:30:5)`
      }
    });

    const [exception] = event.exception!.values;
    expect(exception).toMatchObject({ type: "TypeError", value: "boom" });
    // Sentry lists frames oldest first
    expect(
      exception.stacktrace!.frames.map(({ filename, function: fn, lineno, colno }) => ({
        filename,
        fn,
        lineno,
        colno
      }))
    ).toEqual([
      { filename: CONTENT_URL, fn: "main", lineno: 30, colno: 5 },
      { filename: CONTENT_URL, fn: "zoomIn", lineno: 10, colno: 20 }
    ]);
    expect(event.tags).toMatchObject({ source: "content", application: "Docs" });
    expect(event.release).toBe("1.2.3");
    expect(send).toHaveBeenCalledExactlyOnceWith({});
  });

  test("should show no background frames for an error that has no stack", async () => {
    const { event } = await reportAndCollectEvent({
      ...baseBody,
      error: { name: "Error", message: "no stack" }
    });

    expect(event.exception!.values[0].stacktrace?.frames ?? []).toEqual([]);
  });

  test("should attach the page structure and the redacted sender URL", async () => {
    const { event } = await reportAndCollectEvent({
      ...baseBody,
      error: { name: "Error", message: "boom" }
    });

    expect(event.contexts?.DOM).toEqual(baseBody.dom);
    expect(event.request?.url).toBe("https://docs.google.com/document/[redacted]");
    expect(JSON.stringify(event)).not.toMatch(/DOC_ID_123|KEY_123|resourcekey/);
  });

  test("should report a failed outcome with its reason and the loading error", async () => {
    const { event } = await reportAndCollectEvent({
      ...baseBody,
      reason: "zoom_menu_missing",
      inlineLoadingError: { name: "Error", message: "loading check broke", stack: "Error: x" }
    });

    expect(event.message).toBe("Zoom failed: zoom_menu_missing");
    expect(event.tags).toMatchObject({ zoomFailReason: "zoom_menu_missing" });
    expect(event.extra?.inline_loading_error).toMatchObject({ message: "loading check broke" });
  });

  test("should not carry the tags of one report into the next", async () => {
    await reportAndCollectEvent({ ...baseBody, reason: "page_load_timeout" });
    const { event } = await reportAndCollectEvent({
      ...baseBody,
      application: "Sheets",
      error: { name: "Error", message: "second" }
    });

    expect(event.tags).toMatchObject({ application: "Sheets" });
    expect(event.tags).not.toHaveProperty("zoomFailReason");
  });

  test("should send every report of an identical failure, as each one is a separate failure", async () => {
    await reportAndCollectEvent({ ...baseBody, reason: "zoom_menu_missing" });
    const { event } = await reportAndCollectEvent({ ...baseBody, reason: "zoom_menu_missing" });

    expect(event.message).toBe("Zoom failed: zoom_menu_missing");
  });
});
