import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createFakeChromeStorage } from "../test-support/fake-chrome-storage";

vi.mock("src/utils/localize", () => ({ default: (key: string) => key }));
vi.mock("src/utils/sentry/base", () => ({
  createSentryClient: () => ({ captureException: vi.fn() })
}));

const json = JSON.stringify;
const DEFAULT_DOCS = { zoomValue: "100%", viewOnly: false, classroomSupport: false };

const stubChrome = (initial: Record<string, unknown>) => {
  const fake = createFakeChromeStorage(initial);
  vi.stubGlobal("chrome", fake.chrome);
  // WXT storage captures the chrome global when it is imported, so re-import after each stub.
  vi.resetModules();
  return fake;
};

describe("storage dev tools", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("should reset every app to its default state", async () => {
    const fake = stubChrome({
      docs: { zoomValue: "150%", viewOnly: true, classroomSupport: true }
    });

    const { resetStorageToDefaults } = await import("./storage-dev-tools");
    await resetStorageToDefaults();

    expect(fake.setCalls).toEqual([
      {
        docs: json(DEFAULT_DOCS),
        sheets: json(DEFAULT_DOCS)
      }
    ]);
  });

  test("should write the current settings as plain values", async () => {
    const savedDocs = { zoomValue: "150%", viewOnly: true, classroomSupport: false };
    const fake = stubChrome({ docs: json(savedDocs) });

    const { writeStorageAsPlainValues } = await import("./storage-dev-tools");
    await writeStorageAsPlainValues();

    expect(fake.setCalls).toEqual([{ docs: savedDocs, sheets: DEFAULT_DOCS, schemaVersion: 2 }]);
  });

  test("should let the migration turn the plain values back into JSON text", async () => {
    const savedDocs = { zoomValue: "150%", viewOnly: true, classroomSupport: false };
    const fake = stubChrome({ docs: json(savedDocs) });

    const { writeStorageAsPlainValues } = await import("./storage-dev-tools");
    await writeStorageAsPlainValues();

    // What happens when the background starts against plain values
    vi.resetModules();
    await (
      await import("./migrations")
    ).migrationsReady;

    // Plasmo's own read: JSON.parse of every value
    expect(JSON.parse(fake.data.docs as string)).toEqual(savedDocs);
    expect(JSON.parse(fake.data.sheets as string)).toEqual(DEFAULT_DOCS);
    expect(JSON.parse(fake.data.schemaVersion as string)).toBe(2);
  });
});
