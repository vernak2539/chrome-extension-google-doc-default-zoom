import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe("isChrome", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("should return true when chrome", async () => {
    const { isChrome } = await import("./get-browser");
    vi.stubEnv("PLASMO_BROWSER", "chrome");
    expect(isChrome()).toBe(true);
  });

  test("should return false when not chrome", async () => {
    const { isChrome } = await import("./get-browser");
    vi.stubEnv("PLASMO_BROWSER", "firefox");
    expect(isChrome()).toBe(false);
  });
});

describe("isFirefox", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("should return true when firefox", async () => {
    const { isFirefox } = await import("./get-browser");
    vi.stubEnv("PLASMO_BROWSER", "firefox");
    expect(isFirefox()).toBe(true);
  });

  test("should return false when not firefox", async () => {
    const { isFirefox } = await import("./get-browser");
    vi.stubEnv("PLASMO_BROWSER", "chrome");
    expect(isFirefox()).toBe(false);
  });
});

describe("isEdge", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("should return true when edge", async () => {
    const { isEdge } = await import("./get-browser");
    vi.stubEnv("PLASMO_BROWSER", "edge");
    expect(isEdge()).toBe(true);
  });

  test("should return false when not edge", async () => {
    const { isEdge } = await import("./get-browser");
    vi.stubEnv("PLASMO_BROWSER", "firefox");
    expect(isEdge()).toBe(false);
  });
});

describe("showExtensionVersionsTab", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("should be true when chrome", async () => {
    vi.stubEnv("PLASMO_BROWSER", "chrome");
    const { showExtensionVersionsTab } = await import("./get-browser");
    expect(showExtensionVersionsTab).toBe(true);
  });

  test("should be true when edge", async () => {
    vi.stubEnv("PLASMO_BROWSER", "edge");
    const { showExtensionVersionsTab } = await import("./get-browser");
    expect(showExtensionVersionsTab).toBe(true);
  });

  test("should be false when firefox", async () => {
    vi.stubEnv("PLASMO_BROWSER", "firefox");
    const { showExtensionVersionsTab } = await import("./get-browser");
    expect(showExtensionVersionsTab).toBe(false);
  });
});
