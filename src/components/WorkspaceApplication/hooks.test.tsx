// @vitest-environment jsdom
import { createRoot, type Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  createFakeChromeStorage,
  type FakeChromeStorage
} from "../../test-support/fake-chrome-storage";
import type { UseWorkspaceStorage } from "./hooks";

// src/constants calls localize at import time, and jsdom has no chrome global
vi.mock("src/utils/localize", () => ({ default: (key: string) => key }));

declare global {
  // React reads this to enable act() outside a test runner integration
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

const SAVED_DOCS = { zoomValue: "150%", viewOnly: true, classroomSupport: false };

describe("useWorkspaceStorage", () => {
  let container: HTMLDivElement;
  let root: Root;
  let fake: FakeChromeStorage;
  let latest: UseWorkspaceStorage;

  const mountHook = async (initialStorage: Record<string, unknown>) => {
    fake = createFakeChromeStorage(initialStorage);
    vi.stubGlobal("chrome", fake.chrome);
    // Static import would capture the chrome global once; each test needs a fresh one.
    vi.resetModules();
    const { useWorkspaceStorage } = await import("./hooks");

    const Probe = () => {
      latest = useWorkspaceStorage("docs");
      return null;
    };
    await act(async () => {
      root.render(<Probe />);
    });
  };

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  test("should show defaults without writing when nothing is saved", async () => {
    await mountHook({});

    expect(latest.isLoading).toBe(false);
    expect(latest.zoom).toBe("100%");
    expect(fake.setCalls).toEqual([]);
  });

  test("should show a state saved as plain values without writing", async () => {
    await mountHook({ docs: SAVED_DOCS });

    expect(latest.isLoading).toBe(false);
    expect(latest.zoom).toBe("150%");
    expect(latest.viewOnly).toBe(true);
    expect(fake.setCalls).toEqual([]);
  });

  test("should decode a state saved as JSON text by the Plasmo versions", async () => {
    await mountHook({ docs: JSON.stringify(SAVED_DOCS) });

    expect(latest.isLoading).toBe(false);
    expect(latest.zoom).toBe("150%");
    expect(latest.viewOnly).toBe(true);
    expect(fake.setCalls).toEqual([]);
  });

  test("should write the whole app state when the user changes a setting", async () => {
    await mountHook({});

    await act(async () => {
      latest.updateZoomValue("75%");
    });

    expect(fake.setCalls).toEqual([
      { docs: { zoomValue: "75%", viewOnly: false, classroomSupport: false } }
    ]);
    expect(latest.zoom).toBe("75%");
  });

  test("should fill the fields a saved state lacks, and write them all on a change", async () => {
    await mountHook({ docs: { zoomValue: "150%" } });

    expect(latest.zoom).toBe("150%");
    expect(latest.viewOnly).toBe(false);
    expect(latest.classroomSupport).toBe(false);
    expect(fake.setCalls).toEqual([]);

    await act(async () => {
      latest.updateClassroomSupportValue(true);
    });

    expect(fake.setCalls).toEqual([
      { docs: { zoomValue: "150%", viewOnly: false, classroomSupport: true } }
    ]);
  });

  test("should show the defaults again when the saved state is removed", async () => {
    await mountHook({ docs: SAVED_DOCS });

    await act(async () => {
      await chrome.storage.sync.remove(["docs"]);
    });

    expect(latest.zoom).toBe("100%");
    expect(latest.viewOnly).toBe(false);
    expect(fake.setCalls).toEqual([]);
  });
});
