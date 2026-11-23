import { getDefaultAppState } from "src/constants";
import { describe, expect, test, vi } from "vitest";

import { getAppStorageState } from "./get-app-storage-state";

vi.mock("src/utils/localize", () => ({ default: (key: string) => key }));
vi.mock("src/utils/sentry/base", () => ({
  createSentryClient: () => ({ captureException: vi.fn() })
}));
vi.mock("src/utils/migrations", () => ({ migrationsReady: Promise.resolve() }));
vi.mock("src/utils/storage", () => ({
  SCHEMA_VERSION_KEY: "sync:schemaVersion",
  readStoredValue: async () => {
    throw new Error(
      "IO error: /profile/Sync Extension Settings/abc/MANIFEST-000001: Unable to create sequential file (ChromeMethodBFE: 7::NewSequentialFile::4)"
    );
  }
}));

describe("getAppStorageState", () => {
  test("should answer with the default state when storage fails", async () => {
    expect(await getAppStorageState({ storageKey: "docs" })).toEqual(getDefaultAppState("docs"));
  });
});
