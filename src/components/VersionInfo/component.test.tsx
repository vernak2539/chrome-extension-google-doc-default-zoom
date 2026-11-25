// @vitest-environment jsdom
import { createRoot, type Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import VersionInfo from "./index";

const MESSAGES: Record<string, string> = {
  popupSettingsExtensionVersion: "Version {version}",
  popupSettingsBuildGitInfo: "{branch} @ {commit}"
};

// localize reads the `chrome` global, which doesn't exist under jsdom
vi.mock("../../utils/localize", () => ({
  default: (key: string) => MESSAGES[key] ?? key
}));

describe("VersionInfo", () => {
  let container: HTMLDivElement;
  let root: Root;

  const render = () => {
    act(() => {
      root.render(<VersionInfo />);
    });
  };

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.stubGlobal("chrome", { runtime: { getManifest: () => ({ version: "1.2.3" }) } });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("shows the manifest version in a production build", () => {
    vi.stubEnv("COMMAND", "build");
    vi.stubEnv("GIT_BRANCH", "main");
    vi.stubEnv("GIT_COMMIT", "abc1234");

    render();

    expect(container.textContent).toBe("Version 1.2.3");
  });

  test("shows the branch and commit in dev mode", () => {
    vi.stubEnv("COMMAND", "serve");
    vi.stubEnv("GIT_BRANCH", "feature/x");
    vi.stubEnv("GIT_COMMIT", "abc1234");

    render();

    expect(container.textContent).toBe("Version 1.2.3feature/x @ abc1234");
  });

  test("shows no git text in dev mode when git info is unavailable", () => {
    vi.stubEnv("COMMAND", "serve");
    vi.stubEnv("GIT_BRANCH", "");
    vi.stubEnv("GIT_COMMIT", "");

    render();

    expect(container.textContent).toBe("Version 1.2.3");
  });

  test("shows nothing when the manifest has no version", () => {
    vi.stubGlobal("chrome", {});
    vi.stubEnv("COMMAND", "build");

    render();

    expect(container.textContent).toBe("");
  });
});
