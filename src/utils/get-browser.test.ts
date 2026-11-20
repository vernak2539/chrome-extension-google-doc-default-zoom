import { afterEach, describe, expect, test, vi } from "vitest";

import { isChrome, isEdge, showExtensionVersionsTab } from "./get-browser";

describe("isChrome", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("should return true when chrome", () => {
    vi.stubEnv("BROWSER", "chrome");
    expect(isChrome()).toBe(true);
  });

  test("should return false when not chrome", () => {
    vi.stubEnv("BROWSER", "firefox");
    expect(isChrome()).toBe(false);
  });
});

describe("isEdge", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("should return true when edge", () => {
    vi.stubEnv("BROWSER", "edge");
    expect(isEdge()).toBe(true);
  });

  test("should return false when not edge", () => {
    vi.stubEnv("BROWSER", "firefox");
    expect(isEdge()).toBe(false);
  });
});

describe("showExtensionVersionsTab", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("should be true when chrome", () => {
    vi.stubEnv("BROWSER", "chrome");
    expect(showExtensionVersionsTab()).toBe(true);
  });

  test("should be true when edge", () => {
    vi.stubEnv("BROWSER", "edge");
    expect(showExtensionVersionsTab()).toBe(true);
  });

  test("should be false when firefox", () => {
    vi.stubEnv("BROWSER", "firefox");
    expect(showExtensionVersionsTab()).toBe(false);
  });
});
