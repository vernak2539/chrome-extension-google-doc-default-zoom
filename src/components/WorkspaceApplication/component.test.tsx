// @vitest-environment jsdom
import { createRoot, type Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import type { AppStorageState } from "src/types";
import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import WorkspaceApplicationComponent from "./component";

// localize reads the `chrome` global, which doesn't exist under jsdom
vi.mock("../../utils/localize", () => ({
  default: (key: string) => key
}));

const app = {
  name: "Docs" as const,
  zoomValues: ["50%", "100%", "150%"] as never,
  features: {
    customZoomInput: true,
    enableViewOnlyToggle: true,
    classroomSupport: true
  }
};

const settings = (overrides: Partial<AppStorageState> = {}): AppStorageState => ({
  zoomValue: "123%",
  viewOnly: false,
  classroomSupport: false,
  ...overrides
});

describe("WorkspaceApplicationComponent", () => {
  let container: HTMLDivElement;
  let root: Root;
  let onChange: Mock<(patch: Partial<AppStorageState>) => void>;

  const render = (next: AppStorageState) => {
    act(() => {
      root.render(<WorkspaceApplicationComponent app={app} settings={next} onChange={onChange} />);
    });
  };

  const optionTexts = () =>
    Array.from(container.querySelectorAll("option")).map((option) => option.textContent);
  const textInput = () => container.querySelector<HTMLInputElement>("input:not([type=checkbox])");
  const checkboxes = () =>
    Array.from(container.querySelectorAll<HTMLInputElement>("input[type=checkbox]"));

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.spyOn(console, "error").mockImplementation(() => {});
    onChange = vi.fn();
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

  it("shows N/A in the select and the custom zoom in the input", () => {
    render(settings());

    expect(optionTexts()[0]).toBe("N/A");
    expect(textInput()?.value).toBe("123%");
  });

  it("shows a preset in the select and an empty custom input", () => {
    render(settings({ zoomValue: "150%" }));

    expect(optionTexts()).not.toContain("N/A");
    expect(container.querySelector<HTMLSelectElement>("select")?.value).toBe("150%");
    expect(textInput()?.value).toBe("");
  });

  it("patches only the classroom support setting when its checkbox is clicked", () => {
    render(settings());

    act(() => {
      checkboxes()[1].click();
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ classroomSupport: true });
  });
});
