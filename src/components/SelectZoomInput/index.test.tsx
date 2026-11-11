// @vitest-environment jsdom
import { createRoot, type Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import SelectZoomInput from "./index";

// localize reads the `chrome` global, which doesn't exist under jsdom
vi.mock("../../utils/localize", () => ({
  default: (key: string) => key
}));

describe("SelectZoomInput", () => {
  let container: HTMLDivElement;
  let root: Root;

  const render = (zoomValues: string[], isCustomValue = false) => {
    act(() => {
      root.render(
        <SelectZoomInput
          zoomValue="50%"
          isCustomValue={isCustomValue}
          zoomValues={zoomValues as never}
          updateValue={vi.fn()}
        />
      );
    });
  };

  const optionTexts = () =>
    Array.from(container.querySelectorAll("option")).map((option) => option.textContent);

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.spyOn(console, "error").mockImplementation(() => {});
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  it("renders an option per zoom value", () => {
    render(["50%", "100%"]);
    expect(optionTexts()).toEqual(["50%", "100%"]);
  });

  it("re-renders when the number of zoom values grows", () => {
    render(["50%", "100%"]);
    expect(() => render(["50%", "75%", "100%"])).not.toThrow();
    expect(optionTexts()).toEqual(["50%", "75%", "100%"]);
  });

  it("re-renders when the number of zoom values shrinks", () => {
    render(["50%", "75%", "100%"]);
    expect(() => render(["50%"])).not.toThrow();
    expect(optionTexts()).toEqual(["50%"]);
  });

  it("renders N/A first for custom values, and survives a length change", () => {
    render(["50%", "100%"], true);
    expect(optionTexts()).toEqual(["N/A", "50%", "100%"]);
    expect(() => render(["50%", "75%", "100%"], true)).not.toThrow();
    expect(optionTexts()).toEqual(["N/A", "50%", "75%", "100%"]);
  });
});
