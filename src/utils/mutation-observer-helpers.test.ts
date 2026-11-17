// @vitest-environment jsdom
import { afterEach, describe, expect, test, vi } from "vitest";

import { observeElementAndExecute } from "./mutation-observer-helpers";

const WATCHED = "#watched";

const mutateWatchedElement = async () => {
  document.querySelector(WATCHED)?.setAttribute("data-tick", String(Math.random()));
  // MutationObserver callbacks run in a microtask
  await Promise.resolve();
};

describe("observeElementAndExecute", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("should report watch_element_missing when the element to watch is not on the page", () => {
    const callback = vi.fn();
    const onStop = vi.fn();

    observeElementAndExecute(
      WATCHED,
      { shouldStop: () => false, shouldExecute: () => true },
      callback,
      onStop
    );

    expect(onStop).toHaveBeenCalledExactlyOnceWith("watch_element_missing");
    expect(callback).not.toHaveBeenCalled();
  });

  test("should report page_load_timeout when it gives up before the page is ready", async () => {
    document.body.innerHTML = `<div id="watched"></div>`;
    const callback = vi.fn();
    const onStop = vi.fn();

    observeElementAndExecute(
      WATCHED,
      { shouldStop: () => true, shouldExecute: () => true },
      callback,
      onStop
    );
    await mutateWatchedElement();

    expect(onStop).toHaveBeenCalledExactlyOnceWith("page_load_timeout");
    expect(callback).not.toHaveBeenCalled();
  });

  test("should execute without reporting a stop once the page is ready", async () => {
    document.body.innerHTML = `<div id="watched"></div>`;
    const callback = vi.fn();
    const onStop = vi.fn();

    observeElementAndExecute(
      WATCHED,
      { shouldStop: () => false, shouldExecute: () => true },
      callback,
      onStop
    );
    await mutateWatchedElement();

    expect(callback).toHaveBeenCalledOnce();
    expect(onStop).not.toHaveBeenCalled();
  });
});
