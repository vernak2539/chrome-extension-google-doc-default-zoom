import { describe, expect, test } from "vitest";

import { redactEventRequest, redactUrl } from "./redact-event";

describe("redactUrl", () => {
  test.each([
    [
      "https://docs.google.com/document/d/DOC_ID/edit",
      "https://docs.google.com/document/[redacted]"
    ],
    [
      "https://docs.google.com/spreadsheets/d/SHEET_ID/edit#gid=0",
      "https://docs.google.com/spreadsheets/[redacted]"
    ],
    [
      "https://docs.google.com/document/u/1/d/DOC_ID/edit",
      "https://docs.google.com/document/[redacted]"
    ],
    [
      "https://docs.google.com/u/1/document/d/DOC_ID/edit",
      "https://docs.google.com/document/[redacted]"
    ],
    [
      "https://docs.google.com/spreadsheets/u/0/d/SHEET_ID/preview/sheet",
      "https://docs.google.com/spreadsheets/[redacted]"
    ],
    [
      "https://docs.google.com/document/d/e/PUB_ID/pub",
      "https://docs.google.com/document/[redacted]"
    ],
    [
      "https://docs.google.com/document/d/DOC_ID/edit?usp=sharing&resourcekey=0-KEY#heading=h.abc",
      "https://docs.google.com/document/[redacted]"
    ],
    ["https://docs.google.com/", "https://docs.google.com/"],
    ["https://docs.google.com/somethingelse/SECRET", "https://docs.google.com/[redacted]"],
    [
      "chrome-extension://abc/tabs/experimental-features.html?x=1#docs",
      "chrome-extension://abc/tabs/experimental-features.html"
    ],
    [
      "moz-extension://1b2c3d4e-0000-1111-2222-333344445555/popup.html?x=1#y",
      "moz-extension://[redacted]/popup.html"
    ]
  ])("should redact %s", (input, expected) => {
    expect(redactUrl(input)).toBe(expected);
  });

  test("should redact strings that are not URLs", () => {
    expect(redactUrl("not a url")).toBe("[redacted]");
  });
});

describe("redactEventRequest", () => {
  test("should redact the url and remove the Referer header in any casing", () => {
    const event = redactEventRequest({
      request: {
        url: "https://docs.google.com/document/d/DOC_ID/edit?usp=sharing",
        headers: {
          Referer: "https://docs.google.com/document/d/OTHER_ID/edit",
          referer: "https://docs.google.com/document/d/OTHER_ID/edit",
          "User-Agent": "UA"
        }
      }
    });

    expect(event.request).toEqual({
      url: "https://docs.google.com/document/[redacted]",
      headers: { "User-Agent": "UA" }
    });
  });

  test("should drop query_string, cookies and data", () => {
    const event = redactEventRequest({
      request: {
        url: "https://docs.google.com/document/d/DOC_ID/edit",
        query_string: "resourcekey=0-KEY",
        cookies: { a: "b" },
        data: "secret"
      }
    });

    expect(event.request).toEqual({
      url: "https://docs.google.com/document/[redacted]",
      headers: {}
    });
  });

  test("should leave events without a request alone", () => {
    const event = { message: "hi" };

    expect(redactEventRequest(event)).toEqual({ message: "hi" });
  });
});
