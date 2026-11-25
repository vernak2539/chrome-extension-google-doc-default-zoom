import { getDefaultAppState } from "src/constants";
import { readStoredValue } from "src/utils/storage";
import { describe, expect, test, vi } from "vitest";

import { getAppStorageState } from "./get-app-storage-state";

vi.mock("src/utils/localize", () => ({ default: (key: string) => key }));
vi.mock("src/utils/sentry/base", () => ({
  createSentryClient: () => ({ captureException: vi.fn() })
}));
vi.mock("src/utils/migrations", () => ({ migrationsReady: Promise.resolve() }));
vi.mock("src/utils/storage", () => ({
  SCHEMA_VERSION_KEY: "sync:schemaVersion",
  appStateKey: (storageKey: string) => `sync:${storageKey}`,
  readStoredValue: vi.fn()
}));

describe("getAppStorageState", () => {
  test("should answer with the default state when storage fails", async () => {
    vi.mocked(readStoredValue).mockRejectedValue(
      new Error(
        "IO error: /profile/Sync Extension Settings/abc/MANIFEST-000001: Unable to create sequential file (ChromeMethodBFE: 7::NewSequentialFile::4)"
      )
    );

    expect(await getAppStorageState({ storageKey: "docs" })).toEqual(getDefaultAppState("docs"));
  });

  test("should answer fit for a Fit label saved in a language", async () => {
    vi.mocked(readStoredValue).mockResolvedValue({
      zoomValue: "Anpassen",
      viewOnly: true,
      classroomSupport: false
    });

    expect(await getAppStorageState({ storageKey: "docs" })).toEqual({
      zoomValue: "fit",
      viewOnly: true,
      classroomSupport: false
    });
  });
});
