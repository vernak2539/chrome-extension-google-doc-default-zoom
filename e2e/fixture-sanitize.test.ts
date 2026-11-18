// @vitest-environment jsdom
/// <reference types="node" />
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, test } from "vitest";

import {
  findFixtureLeaks,
  missingSelectors,
  parseFixture,
  sanitizeFixture
} from "./fixture-sanitize";
import { CAPTURE_TARGETS, FIXTURES_DIR } from "./targets";

// What a signed-out capture can contain besides the markup the extension needs
const DIRTY_PAGE = `
<html><head><title>Q3 salary plan</title><style>.x{}</style><script>var token = "abc";</script></head>
<body>
  <div id="gb"><a href="https://accounts.google.com/SignOutOptions?hl=en">jane.doe@example.com</a></div>
  <div id="docs-chrome" data-doc-id="1AbC" style="color:red" onclick="steal()">
    <img src="https://lh3.googleusercontent.com/a/avatar.png" alt="Jane Doe">
    <svg><path d="M0 0"></path></svg>
    <input id="docs-title-input" aria-label="Q3 salary plan" value="Q3 salary plan, ask jane.doe@example.com">
    <div class="docs-presence-plus-collab-widget-container" role="button" aria-label="Jane Doe"></div>
    <div id="docs-toolbar">
      <span>Shared with https://example.com/team</span>
      <div id="zoomSelect" class="goog-toolbar-combo-button" role="combobox" aria-owns="zoom-menu" aria-label="Zoom, see https://example.com/help">
        <input type="text" value="100%">
      </div>
    </div>
  </div>
  <div class="goog-menu" id="zoom-menu" role="menu" tabindex="0">
    <div class="goog-menuitem apps-menuitem"><div>150%</div></div>
    <div class="goog-menuitem apps-menuitem"><div>Open jane.doe@example.com</div></div>
  </div>
  <div class="goog-menu" id="empty-menu"></div>
  <iframe src="https://docs.google.com/static/frame.html"></iframe>
  <p>Confidential paragraph</p>
</body></html>`;

const sanitize = (mode: "editor" | "view") => sanitizeFixture(parseFixture(DIRTY_PAGE), mode);

describe("sanitizeFixture", () => {
  test("drops document data, URLs, emails and scripts from a captured page", () => {
    const html = sanitize("editor");

    expect(findFixtureLeaks(html)).toEqual([]);
    for (const leaked of [
      "salary",
      "jane.doe",
      "Jane Doe",
      "Confidential",
      "steal",
      "data-doc-id",
      "<img"
    ]) {
      expect(html).not.toContain(leaked);
    }
  });

  test("keeps what the extension reads: zoom control, its value, menu rows and canvas", () => {
    const doc = parseFixture(sanitize("editor"));

    expect(missingSelectors(doc, "editor")).toEqual([]);
    expect(doc.querySelector("#zoomSelect input")?.getAttribute("value")).toBe("100%");
    expect(doc.querySelector("#docs-title-input")?.hasAttribute("value")).toBe(false);
    expect(doc.querySelector("#zoomSelect")?.getAttribute("aria-owns")).toBe("zoom-menu");
    expect(doc.querySelector(".goog-menuitem")?.firstChild?.textContent).toBe("150%");
    expect(doc.querySelectorAll("canvas")).toHaveLength(1);
  });

  test("drops menus without rows and removes the zoom control in view mode", () => {
    const doc = parseFixture(sanitize("view"));

    expect(doc.querySelector("#empty-menu")).toBeNull();
    expect(doc.querySelector("#zoomSelect")).toBeNull();
    expect(doc.querySelector("#zoom-menu")).not.toBeNull();
  });
});

describe("findFixtureLeaks", () => {
  test.each([
    ["script element", "<script>1</script>"],
    ["iframe element", "<iframe></iframe>"],
    ["svg element", "<svg></svg>"],
    ["event handler attribute", '<div onclick="x()"></div>'],
    ["http(s) URL", '<div aria-label="http://example.com"></div>'],
    ["email address", "<div>a@example.com</div>"]
  ])("reports %s", (label, html) => {
    expect(findFixtureLeaks(html)).toContain(label);
  });

  test("reports nothing for markup without those", () => {
    expect(findFixtureLeaks('<div id="zoomSelect" class="a"><input value="100%"></div>')).toEqual(
      []
    );
  });
});

describe("missingSelectors", () => {
  test("names every selector the page lacks", () => {
    const missing = missingSelectors(parseFixture("<div id='docs-chrome'></div>"), "editor");

    expect(missing).toEqual(
      expect.arrayContaining(["#docs-toolbar", "#zoomSelect, #t-zoom", "canvas"])
    );
  });

  test("flags a zoom control whose aria-owns points to no menu", () => {
    const doc = parseFixture(
      "<div id='docs-chrome'><div id='docs-toolbar'><div id='zoomSelect' aria-owns='nope'><input></div></div></div>" +
        "<div class='goog-menu'><div class='goog-menuitem'>50%</div></div><canvas></canvas>"
    );

    expect(missingSelectors(doc, "editor")).toEqual([
      "the zoom menu that the zoom control's aria-owns points to"
    ]);
  });
});

// The same gate the capture step runs, so a hand edited or refreshed fixture can't go stale unnoticed
describe("committed fixtures", () => {
  test.each(CAPTURE_TARGETS)("$name is complete and has no leaks", ({ name, mode }) => {
    const html = readFileSync(path.join(FIXTURES_DIR, `${name}.html`), "utf8");

    expect(missingSelectors(parseFixture(html), mode)).toEqual([]);
    expect(findFixtureLeaks(html)).toEqual([]);
  });
});
