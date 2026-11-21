import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createFakeChromeStorage } from "../test-support/fake-chrome-storage";

vi.mock("src/utils/localize", () => ({ default: (key: string) => key }));
vi.mock("src/utils/sentry/base", () => ({
  createSentryClient: () => ({ captureException: vi.fn() })
}));

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
        docs: DEFAULT_DOCS,
        sheets: DEFAULT_DOCS
      }
    ]);
  });

  test("should write the current settings as the JSON text Plasmo used", async () => {
    const savedDocs = { zoomValue: "150%", viewOnly: true, classroomSupport: false };
    const fake = stubChrome({ docs: savedDocs });

    const { writeStorageInLegacyFormat } = await import("./storage-dev-tools");
    await writeStorageInLegacyFormat();

    const [write] = fake.setCalls;
    expect(JSON.parse(write.docs as string)).toEqual(savedDocs);
    expect(JSON.parse(write.sheets as string)).toEqual(DEFAULT_DOCS);
    expect(write.schemaVersion).toBe(JSON.stringify(2));
  });

  test("should let the migration read settings written in the legacy format", async () => {
    const savedDocs = { zoomValue: "150%", viewOnly: true, classroomSupport: false };
    const fake = stubChrome({ docs: savedDocs });

    const { writeStorageInLegacyFormat } = await import("./storage-dev-tools");
    await writeStorageInLegacyFormat();

    // What happens when the new build starts against the values the old build left behind
    vi.resetModules();
    await (
      await import("./migrations")
    ).migrationsReady;

    expect(fake.data.docs).toEqual(savedDocs);
    expect(fake.data.sheets).toEqual(DEFAULT_DOCS);
    expect(fake.data.schemaVersion).toBe(2);
  });
});
