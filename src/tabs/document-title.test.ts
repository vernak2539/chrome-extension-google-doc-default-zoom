// @vitest-environment jsdom
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("../utils/localize", () => ({ default: (key: string) => key }));
vi.mock("../utils/sentry/base", () => ({
  createSentryClient: vi.fn(() => ({ captureException: vi.fn() }))
}));
vi.mock("../utils/logger/index", () => ({
  default: class {
    error = vi.fn();
  }
}));

describe("tab page titles", () => {
  beforeEach(() => {
    vi.resetModules();
    document.title = "";
  });

  test("should set the localized title for the extension versions tab", async () => {
    await import("./ext-versions");

    expect(document.title).toBe("ExtVersionsTabHeader");
  });

  test("should set the localized title for the experimental features tab", async () => {
    await import("./experimental-features");

    expect(document.title).toBe("ExperimentalFeaturesTabHeader");
  });
});
