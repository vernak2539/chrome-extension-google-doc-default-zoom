// @vitest-environment jsdom
import { createRoot, type Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import type { Announcement } from "src/utils/announcement";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AnnouncementComponent from "./component";

// localize reads the `chrome` global, which doesn't exist under jsdom
vi.mock("../../utils/localize", () => ({
  default: (key: string) => key
}));

const announcement = (overrides: Partial<Announcement> = {}): Announcement => ({
  id: "test",
  level: "info",
  dismissible: true,
  message: "Hello",
  ...overrides
});

describe("AnnouncementComponent", () => {
  let container: HTMLDivElement;
  let root: Root;

  const render = (value: Announcement) => {
    act(() => {
      root.render(<AnnouncementComponent announcement={value} />);
    });
  };

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("renders the link with its text, opening in a new tab without opener access", () => {
    render(announcement({ link: { url: "https://example.com/more", text: "Read more" } }));

    const anchor = container.querySelector("a");
    expect(anchor?.textContent).toBe("Read more");
    expect(anchor?.getAttribute("href")).toBe("https://example.com/more");
    expect(anchor?.getAttribute("target")).toBe("_blank");
    expect(anchor?.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("renders no link when the announcement has none", () => {
    render(announcement());

    expect(container.querySelector("a")).toBeNull();
    expect(container.textContent).toBe("Hello");
  });
});
