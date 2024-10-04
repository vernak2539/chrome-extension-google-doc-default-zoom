import { afterEach, describe, expect, test, vi } from "vitest";
import { isChrome, isEdge, isFirefox } from "./get-browser";

describe("isChrome", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("should return true when chrome", () => {
    vi.stubEnv("PLASMO_BROWSER", "chrome");
    expect(isChrome()).toBe(true);
  });

  test("should return false when not chrome", () => {
    vi.stubEnv("PLASMO_BROWSER", "firefox");
    expect(isChrome()).toBe(false);
  });
});

describe("isFirefox", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("should return true when firefox", () => {
    vi.stubEnv("PLASMO_BROWSER", "firefox");
    expect(isFirefox()).toBe(true);
  });

  test("should return false when not firefox", () => {
    vi.stubEnv("PLASMO_BROWSER", "chrome");
    expect(isFirefox()).toBe(false);
  });
});

describe("isEdge", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("should return true when edge", () => {
    vi.stubEnv("PLASMO_BROWSER", "edge");
    expect(isEdge()).toBe(true);
  });

  test("should return false when not edge", () => {
    vi.stubEnv("PLASMO_BROWSER", "firefox");
    expect(isEdge()).toBe(false);
  });
});
