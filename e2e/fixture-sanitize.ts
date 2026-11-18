// Turns a captured Docs/Sheets page into a fixture that is safe to commit.
//
// Everything is an allowlist: only the elements, attributes and text the extension needs are kept, so
// anything Google adds later (or anything document specific) is dropped instead of leaked.

export type FixtureMode = "editor" | "view";

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

// `docs-presence` widgets name the people in the document: random animals signed out, real names signed in
const REMOVED_ELEMENTS =
  "svg, #gb, script, style, link, iframe, img, noscript, meta, [class*='docs-presence']";
const KEPT_ATTRIBUTES = new Set([
  "id",
  "class",
  "role",
  "type",
  "value",
  "aria-label",
  "aria-owns",
  "aria-activedescendant"
]);
const ZOOM_CONTROLS = "#zoomSelect, #t-zoom";
const REDACTED = "[redacted]";

const URL_PATTERN = /https?:\/\/[^\s"'<>)]+/gi;
const EMAIL_PATTERN = /[^\s@"'<>]+@[^\s@"'<>]+\.[^\s@"'<>]+/g;

const redact = (text: string) =>
  text.replace(URL_PATTERN, REDACTED).replace(EMAIL_PATTERN, REDACTED);

const scrubAttributes = (element: Element) => {
  for (const { name, value } of Array.from(element.attributes)) {
    if (KEPT_ATTRIBUTES.has(name)) {
      element.setAttribute(name, redact(value));
    } else {
      element.removeAttribute(name);
    }
  }

  // typed text can be anything, only the zoom boxes have a value the extension cares about. Docs also
  // labels the title box with the document title.
  const isFormField = element.matches("input, textarea");
  if (isFormField && !element.closest(ZOOM_CONTROLS)) {
    element.removeAttribute("value");
    element.removeAttribute("aria-label");
  }
};

// Text is only kept in menu rows: that is where the extension matches zoom values
const scrubChildren = (parent: Element, insideMenuItem: boolean) => {
  for (const child of Array.from(parent.childNodes)) {
    if (child.nodeType === ELEMENT_NODE) {
      const element = child as Element;
      scrubAttributes(element);
      scrubChildren(element, insideMenuItem || element.classList.contains("goog-menuitem"));
    } else if (child.nodeType === TEXT_NODE && insideMenuItem) {
      child.textContent = redact(child.textContent ?? "");
    } else {
      child.parentNode?.removeChild(child);
    }
  }
};

const sanitizeClone = (source: Element, mode: FixtureMode): string => {
  const clone = source.cloneNode(true) as Element;

  clone.querySelectorAll(REMOVED_ELEMENTS).forEach((element) => element.remove());
  if (mode === "view") {
    clone.querySelectorAll(ZOOM_CONTROLS).forEach((element) => element.remove());
  }

  scrubAttributes(clone);
  scrubChildren(clone, clone.classList.contains("goog-menuitem"));
  return clone.outerHTML;
};

// Menus are attached to the body, outside #docs-chrome, so they are collected on their own
const findMenusWithRows = (doc: Document): Element[] =>
  Array.from(doc.querySelectorAll(".goog-menu")).filter(
    (menu) =>
      menu.querySelector(".goog-menuitem") &&
      !menu.closest("#docs-chrome") &&
      !menu.parentElement?.closest(".goog-menu")
  );

export const sanitizeFixture = (doc: Document, mode: FixtureMode): string => {
  const chrome = doc.querySelector("#docs-chrome");
  const parts = [
    ...(chrome ? [sanitizeClone(chrome, mode)] : []),
    ...findMenusWithRows(doc).map((menu) => sanitizeClone(menu, mode)),
    "<canvas></canvas>"
  ];

  return parts.join("\n");
};

export const parseFixture = (html: string): Document =>
  new DOMParser().parseFromString(html, "text/html");

const LEAK_PATTERNS: Array<[string, RegExp]> = [
  ["script element", /<script/i],
  ["iframe element", /<iframe/i],
  ["svg element", /<svg/i],
  ["event handler attribute", /<[^>]*\son[a-z]+\s*=/i],
  ["http(s) URL", /https?:\/\//i],
  ["email address", /[^\s@"'<>]+@[^\s@"'<>]+\.[^\s@"'<>]+/]
];

export const findFixtureLeaks = (html: string): string[] =>
  LEAK_PATTERNS.filter(([, pattern]) => pattern.test(html)).map(([label]) => label);

const hasZoomMenu = (doc: Document, zoomControl: Element): boolean => {
  const ownsId = zoomControl.getAttribute("aria-owns");
  if (!ownsId) {
    return false;
  }

  if (doc.getElementById(ownsId)?.closest(".goog-menu")) {
    return true;
  }

  return Array.from(doc.querySelectorAll(".goog-menu")).some(
    (menu) => menu.getAttribute("aria-activedescendant") === ownsId
  );
};

// What the extension's selectors need from a fixture; each entry is one selector (or alternatives)
const REQUIRED_SELECTORS: Record<FixtureMode, string[]> = {
  editor: [
    "#docs-chrome",
    "#docs-toolbar",
    "#zoomSelect, #t-zoom",
    "#zoomSelect input, #t-zoom input",
    ".goog-menu .goog-menuitem",
    "canvas"
  ],
  view: [
    "#docs-chrome",
    "#docs-view-menu",
    "span[aria-label^='Zoom']",
    "[aria-label^='Fit']",
    ".goog-menuitem.apps-menuitem",
    "canvas"
  ]
};

export const missingSelectors = (doc: Document, mode: FixtureMode): string[] => {
  const missing = REQUIRED_SELECTORS[mode].filter((selector) => !doc.querySelector(selector));

  if (mode === "editor") {
    const zoomControl = doc.querySelector(ZOOM_CONTROLS);
    if (zoomControl && !hasZoomMenu(doc, zoomControl)) {
      missing.push("the zoom menu that the zoom control's aria-owns points to");
    }
  }

  if (mode === "view" && doc.querySelector(ZOOM_CONTROLS)) {
    missing.push("no #zoomSelect or #t-zoom (a view-only fixture has no zoom control)");
  }

  return missing;
};
