// @vitest-environment jsdom
import { createRoot, type Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  createFakeChromeStorage,
  type FakeChromeStorage
} from "../../test-support/fake-chrome-storage";

// src/constants calls localize at import time, and jsdom has no chrome global
vi.mock("src/utils/localize", () => ({ default: (key: string) => key }));

type UseWorkspaceStorage = typeof import("./hooks").useWorkspaceStorage;
type HookResult = ReturnType<UseWorkspaceStorage>;

const SAVED_DOCS = { zoomValue: "150%", viewOnly: true, classroomSupport: false };

describe("useWorkspaceStorage", () => {
  let container: HTMLDivElement;
  let root: Root;
  let fake: FakeChromeStorage;
  let latest: HookResult;

  const mountHook = async (initialStorage: Record<string, unknown>) => {
    fake = createFakeChromeStorage(initialStorage);
    vi.stubGlobal("chrome", fake.chrome);
    vi.resetModules();
    const { useWorkspaceStorage } = await import("./hooks");

    const Probe = () => {
      latest = useWorkspaceStorage("docs", "100%");
      return null;
    };
    await act(async () => {
      root.render(<Probe />);
    });
  };

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
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

  test("should show the saved state without writing", async () => {
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
      { docs: JSON.stringify({ zoomValue: "75%", viewOnly: false, classroomSupport: false }) }
    ]);
    expect(latest.zoom).toBe("75%");
  });
});
