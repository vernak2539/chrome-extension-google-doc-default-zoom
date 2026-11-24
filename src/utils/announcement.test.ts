import { afterEach, describe, expect, it, vi } from "vitest";

import {
  compareVersions,
  fetchAnnouncements,
  parseAnnouncement,
  parseAnnouncements,
  pickLocalizedMessage,
  resolveAnnouncement,
  resolveAnnouncements,
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
    ["array messages", { id: "a", active: true, messages: ["Hi"] }],
    ["editions that is not an array", { ...remote(), editions: "base" }],
    ["an unknown edition", { ...remote(), editions: ["base", "pro"] }],
    ["an empty editions list", { ...remote(), editions: [] }],
    [
      "a javascript: link",
      { ...remote(), link: { url: "javascript:alert(1)", text: { en: "Go" } } }
    ],
    ["an http: link", { ...remote(), link: { url: "http://example.com", text: { en: "Go" } } }],
    [
      "a link URL that is not a URL",
      { ...remote(), link: { url: "example.com", text: { en: "Go" } } }
    ],
    ["a link without a URL", { ...remote(), link: { text: { en: "Go" } } }],
    [
      "a link without en text",
      { ...remote(), link: { url: "https://example.com", text: { de: "Los" } } }
    ],
    [
      "a link with plain string text",
      { ...remote(), link: { url: "https://example.com", text: "Go" } }
    ],
    ["a link that is not an object", { ...remote(), link: "https://example.com" }]
  ])("rejects %s", (_, data) => {
    expect(parseAnnouncement(data)).toBeNull();
  });

  it("accepts an https link and drops unknown link keys", () => {
    const link = { url: "https://example.com/more", text: { en: "More", de: "Mehr" } };

    expect(
      parseAnnouncement({ ...remote(), link: { ...link, onclick: "evil()" } })?.link
    ).toStrictEqual(link);
  });

  it("accepts editions", () => {
    expect(parseAnnouncement(remote({ editions: ["base", "extended"] }))?.editions).toEqual([
      "base",
      "extended"
    ]);
  });
});

describe("parseAnnouncements", () => {
  it("parses a list, skipping invalid entries", () => {
    expect(
      parseAnnouncements([remote({ id: "a" }), { id: "broken" }, remote({ id: "b" })])
    ).toEqual([remote({ id: "a" }), remote({ id: "b" })]);
  });

  it("keeps the first entry when ids are duplicated", () => {
    expect(
      parseAnnouncements([
        remote({ messages: { en: "First" } }),
        remote({ messages: { en: "Second" } })
      ])
    ).toEqual([remote({ messages: { en: "First" } })]);
  });

  it("accepts a single object", () => {
    expect(parseAnnouncements(remote())).toEqual([remote()]);
  });

  it("skips an entry with invalid editions without affecting the others", () => {
    expect(
      parseAnnouncements([remote({ id: "a" }), { ...remote({ id: "bad" }), editions: [] }])
    ).toEqual([remote({ id: "a" })]);
  });

  it("returns an empty list for invalid data", () => {
    expect(parseAnnouncements(null)).toEqual([]);
    expect(parseAnnouncements([])).toEqual([]);
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
  const options = { uiLocale: "de", extensionVersion: "0.15.3", edition: "base" as const };

  it("returns the localized announcement with defaults", () => {
    expect(resolveAnnouncement(remote(), options)).toEqual({
      id: "test",
      level: "info",
      dismissible: true,
      message: "Hallo"
    });
  });

  it("localizes the link text and falls back to English", () => {
    const link = { url: "https://example.com", text: { en: "More", de: "Mehr" } };

    expect(resolveAnnouncement(remote({ link }), options)?.link).toEqual({
      url: "https://example.com",
      text: "Mehr"
    });
    expect(resolveAnnouncement(remote({ link }), { ...options, uiLocale: "ja" })?.link?.text).toBe(
      "More"
    );
  });

  it("omits the link when the announcement has none", () => {
    expect(resolveAnnouncement(remote(), options)).not.toHaveProperty("link");
  });

  it("hides inactive or missing announcements", () => {
    expect(resolveAnnouncement(null, options)).toBeNull();
    expect(resolveAnnouncement(remote({ active: false }), options)).toBeNull();
  });

  it("hides announcements from versions newer than maxVersion", () => {
    expect(resolveAnnouncement(remote({ maxVersion: "0.15.3" }), options)).not.toBeNull();
    expect(resolveAnnouncement(remote({ maxVersion: "0.15.2" }), options)).toBeNull();
  });

  it("shows an announcement without editions in both editions", () => {
    expect(resolveAnnouncement(remote(), { ...options, edition: "base" })).not.toBeNull();
    expect(resolveAnnouncement(remote(), { ...options, edition: "extended" })).not.toBeNull();
  });

  it("shows an announcement only in the editions it lists", () => {
    const baseOnly = remote({ editions: ["base"] });
    const extendedOnly = remote({ editions: ["extended"] });
    const both = remote({ editions: ["base", "extended"] });

    expect(resolveAnnouncement(baseOnly, { ...options, edition: "base" })).not.toBeNull();
    expect(resolveAnnouncement(baseOnly, { ...options, edition: "extended" })).toBeNull();
    expect(resolveAnnouncement(extendedOnly, { ...options, edition: "base" })).toBeNull();
    expect(resolveAnnouncement(extendedOnly, { ...options, edition: "extended" })).not.toBeNull();
    expect(resolveAnnouncement(both, { ...options, edition: "base" })).not.toBeNull();
    expect(resolveAnnouncement(both, { ...options, edition: "extended" })).not.toBeNull();
  });

  it("hides a dismissed announcement, but not a new one", () => {
    expect(resolveAnnouncement(remote(), { ...options, dismissedIds: ["test"] })).toBeNull();
    expect(
      resolveAnnouncement(remote({ id: "new" }), { ...options, dismissedIds: ["test"] })
    ).not.toBeNull();
  });

  it("ignores dismissal when the announcement is not dismissible", () => {
    expect(
      resolveAnnouncement(remote({ dismissible: false }), { ...options, dismissedIds: ["test"] })
    ).not.toBeNull();
  });
});

describe("resolveAnnouncements", () => {
  it("keeps visible announcements in file order", () => {
    const result = resolveAnnouncements(
      [
        remote({ id: "a" }),
        remote({ id: "inactive", active: false }),
        remote({ id: "dismissed" }),
        remote({ id: "b" })
      ],
      { uiLocale: "en", extensionVersion: "0.15.3", edition: "base", dismissedIds: ["dismissed"] }
    );
    expect(result.map((announcement) => announcement.id)).toEqual(["a", "b"]);
  });
});

describe("fetchAnnouncements", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the parsed list", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: () => Promise.resolve([remote()]) });
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchAnnouncements("https://example.test/a.json")).resolves.toEqual([remote()]);
  });

  it("returns an empty list on a non-OK response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await expect(fetchAnnouncements("https://example.test/a.json")).resolves.toEqual([]);
  });
});
