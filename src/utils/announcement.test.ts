import { afterEach, describe, expect, it, vi } from "vitest";

import {
  compareVersions,
  fetchAnnouncement,
  parseAnnouncement,
  pickLocalizedMessage,
  resolveAnnouncement,
  type RemoteAnnouncement
} from "./announcement";

const remote = (overrides: Partial<RemoteAnnouncement> = {}): RemoteAnnouncement => ({
  id: "test",
  active: true,
  messages: { en: "Hello", de: "Hallo", pt_BR: "Olá" },
  ...overrides
});

describe("parseAnnouncement", () => {
  it("accepts a valid announcement", () => {
    expect(parseAnnouncement(remote({ level: "warning", maxVersion: "1.0.0" }))).toEqual(
      remote({ level: "warning", maxVersion: "1.0.0" })
    );
  });

  it.each([
    ["null", null],
    ["a string", "hello"],
    ["missing id", { active: true, messages: { en: "Hi" } }],
    ["non-boolean active", { id: "a", active: "true", messages: { en: "Hi" } }],
    ["unknown level", { id: "a", active: true, level: "error", messages: { en: "Hi" } }],
    ["missing en message", { id: "a", active: true, messages: { de: "Hallo" } }],
    ["non-string message", { id: "a", active: true, messages: { en: 1 } }],
    ["array messages", { id: "a", active: true, messages: ["Hi"] }]
  ])("rejects %s", (_, data) => {
    expect(parseAnnouncement(data)).toBeNull();
  });
});

describe("pickLocalizedMessage", () => {
  const messages = { en: "Hello", de: "Hallo", pt_BR: "Olá" };

  it("matches the exact locale", () => {
    expect(pickLocalizedMessage(messages, "pt-BR")).toBe("Olá");
  });

  it("falls back to the base language", () => {
    expect(pickLocalizedMessage(messages, "de-AT")).toBe("Hallo");
  });

  it("falls back to English", () => {
    expect(pickLocalizedMessage(messages, "ja")).toBe("Hello");
    expect(pickLocalizedMessage(messages, "")).toBe("Hello");
  });
});

describe("compareVersions", () => {
  it("compares numerically, not lexically", () => {
    expect(compareVersions("0.15.10", "0.15.9")).toBeGreaterThan(0);
    expect(compareVersions("0.15.3", "0.15.3")).toBe(0);
    expect(compareVersions("0.15", "0.15.1")).toBeLessThan(0);
  });
});

describe("resolveAnnouncement", () => {
  const options = { uiLocale: "de", extensionVersion: "0.15.3" };

  it("returns the localized announcement with defaults", () => {
    expect(resolveAnnouncement(remote(), options)).toEqual({
      id: "test",
      level: "info",
      dismissible: true,
      message: "Hallo"
    });
  });

  it("hides inactive or missing announcements", () => {
    expect(resolveAnnouncement(null, options)).toBeNull();
    expect(resolveAnnouncement(remote({ active: false }), options)).toBeNull();
  });

  it("hides announcements from versions newer than maxVersion", () => {
    expect(resolveAnnouncement(remote({ maxVersion: "0.15.3" }), options)).not.toBeNull();
    expect(resolveAnnouncement(remote({ maxVersion: "0.15.2" }), options)).toBeNull();
  });

  it("hides a dismissed announcement, but not a new one", () => {
    expect(resolveAnnouncement(remote(), { ...options, dismissedId: "test" })).toBeNull();
    expect(
      resolveAnnouncement(remote({ id: "new" }), { ...options, dismissedId: "test" })
    ).not.toBeNull();
  });

  it("ignores dismissal when the announcement is not dismissible", () => {
    expect(
      resolveAnnouncement(remote({ dismissible: false }), { ...options, dismissedId: "test" })
    ).not.toBeNull();
  });
});

describe("fetchAnnouncement", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the parsed announcement", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(remote()) })
    );
    await expect(fetchAnnouncement("https://example.test")).resolves.toEqual(remote());
  });

  it("returns null on a non-OK response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await expect(fetchAnnouncement("https://example.test")).resolves.toBeNull();
  });
});
