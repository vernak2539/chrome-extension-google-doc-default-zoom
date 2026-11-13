// @vitest-environment jsdom
import { beforeEach, describe, expect, test } from "vitest";

import { findZoomMenu } from "./find-zoom-menu";

const renderMenu = (menuId: string, activeItemId: string) => {
  document.body.insertAdjacentHTML(
    "beforeend",
    `<div class="goog-menu goog-menu-vertical" id="${menuId}" role="listbox" aria-activedescendant="${activeItemId}">
      <div class="goog-menuitem" role="option" id=":a"><div>50%</div></div>
      <div class="goog-menuitem" role="option" id="${activeItemId}"><div>100%</div></div>
    </div>`
  );
  return document.getElementById(menuId);
};

const renderCombobox = (ariaOwns?: string) => {
  const combobox = document.createElement("div");
  combobox.id = "zoomSelect";
  if (ariaOwns !== undefined) {
    combobox.setAttribute("aria-owns", ariaOwns);
  }
  document.body.appendChild(combobox);
  return combobox;
};

describe("findZoomMenu", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("finds the menu when aria-owns holds the menu id (current Docs and Sheets)", () => {
    renderMenu("other:menu", ":x");
    const menu = renderMenu("3dg2fq:q3", ":2o");
    const combobox = renderCombobox("3dg2fq:q3");

    expect(findZoomMenu(combobox)).toBe(menu);
  });

  test("finds the menu when aria-owns holds the highlighted item id (previous layout)", () => {
    renderMenu("other:menu", ":x");
    const menu = renderMenu("b7efqv:1ad", ":by");
    const combobox = renderCombobox(":by");

    expect(findZoomMenu(combobox)).toBe(menu);
  });

  test("finds the menu by aria-activedescendant when no element has the aria-owns id", () => {
    const menu = renderMenu("menu", ":by");
    menu.querySelector("#\\:by").removeAttribute("id");
    const combobox = renderCombobox(":by");

    expect(findZoomMenu(combobox)).toBe(menu);
  });

  test("returns null when the combobox has no aria-owns", () => {
    renderMenu("menu", ":by");

    expect(findZoomMenu(renderCombobox())).toBeNull();
  });

  test("returns null when aria-owns points at nothing", () => {
    renderMenu("menu", ":by");

    expect(findZoomMenu(renderCombobox("missing"))).toBeNull();
  });
});
