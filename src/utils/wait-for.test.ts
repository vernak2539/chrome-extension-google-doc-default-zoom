// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { waitFor } from "./wait-for";

describe("waitFor", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  test("should resolve with an element that is already on the page", async () => {
    document.body.innerHTML = `<div id="target"></div>`;

    expect(await waitFor("#target", 1000)).toBe(document.querySelector("#target"));
  });

  test("should resolve when the element is added later", async () => {
    const result = waitFor("#target", 1000);
    document.body.innerHTML = `<div id="target"></div>`;

    expect(await result).toBe(document.querySelector("#target"));
  });

  test("should resolve when an existing element starts to match through an attribute", async () => {
    document.body.innerHTML = `<span id="item"></span>`;
    const result = waitFor("span[aria-label^='Zoom']", 1000);
    document.querySelector("#item")?.setAttribute("aria-label", "Zoom");

    expect(await result).toBe(document.querySelector("#item"));
  });

  test("should skip an existing element that fails the predicate and resolve with a matching one", async () => {
    document.body.innerHTML = `<div class="row">decoy</div><div class="row">50%</div>`;
    const result = waitFor(".row", 1000, (element) => element.textContent === "150%");

    document.body.innerHTML += `<div class="row">150%</div>`;

    expect(await result).toBe(document.querySelectorAll(".row")[2]);
  });

  test("should resolve with null when nothing matches within the timeout", async () => {
    const result = waitFor("#target", 1000);
    await vi.advanceTimersByTimeAsync(1000);

    expect(await result).toBeNull();
  });

  test("should stop waiting after the timeout, so a late element changes nothing", async () => {
    const result = waitFor("#target", 1000);
    await vi.advanceTimersByTimeAsync(1000);
    document.body.innerHTML = `<div id="target"></div>`;
    await Promise.resolve();

    expect(await result).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });
});
