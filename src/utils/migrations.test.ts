import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { DOCS_FIT_LABELS } from "../constants";
import { createFakeChromeStorage } from "../test-support/fake-chrome-storage";

vi.mock("src/utils/localize", () => ({ default: (key: string) => key }));
vi.mock("src/utils/sentry/base", () => ({
  createSentryClient: () => ({ captureException: vi.fn() })
}));

const json = JSON.stringify;
const DOCS_150 = { zoomValue: "150%", viewOnly: true, classroomSupport: true };

const runMigrationsAgainst = async (initial: Record<string, unknown>) => {
  const fake = createFakeChromeStorage(initial);
  vi.stubGlobal("chrome", fake.chrome);
  vi.resetModules();
  await (
    await import("./migrations")
  ).migrationsReady;
  return fake;
};

describe("storage migrations", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("should migrate V1 keys in one write and then remove them", async () => {
    const fake = await runMigrationsAgainst({
      zoomValue: json("150%"),
      "zoomValue:viewOnly": json(true),
      "sheets:zoomValue": json("75%")
    });

    expect(fake.setCalls).toEqual([
      {
        docs: json({ zoomValue: "150%", viewOnly: true, classroomSupport: false }),
        sheets: json({ zoomValue: "75%", viewOnly: false, classroomSupport: false }),
        schemaVersion: json(2)
      }
    ]);
    expect(Object.keys(fake.data).sort()).toEqual(["docs", "schemaVersion", "sheets"]);
  });

  test("should keep saved values when rerun after an interrupted migration", async () => {
    // docs was already migrated and edited, but cleanup stopped before the V1 keys were removed
    const fake = await runMigrationsAgainst({
      docs: json(DOCS_150),
      "sheets:zoomValue": json("75%"),
      "zoomValue:viewOnly": json(false)
    });

    expect(JSON.parse(fake.data.docs as string)).toEqual(DOCS_150);
    expect(JSON.parse(fake.data.sheets as string)).toEqual({
      zoomValue: "75%",
      viewOnly: false,
      classroomSupport: false
    });
    expect(fake.data.schemaVersion).toBe(json(2));
    expect(Object.keys(fake.data).sort()).toEqual(["docs", "schemaVersion", "sheets"]);
  });

  test("should only remove leftover V1 keys once the schema version is current", async () => {
    const fake = await runMigrationsAgainst({
      schemaVersion: json(2),
      docs: json(DOCS_150),
      "sheets:zoomValue": json("75%")
    });

    expect(fake.setCalls).toEqual([]);
    expect(fake.removeCalls).toEqual([["sheets:zoomValue"]]);
    expect(JSON.parse(fake.data.docs as string)).toEqual(DOCS_150);
  });

  test("should write only the schema version on a fresh install", async () => {
    const fake = await runMigrationsAgainst({});

    expect(fake.setCalls).toEqual([{ schemaVersion: json(2) }]);
    expect(fake.removeCalls).toEqual([]);
  });

  test.each(DOCS_FIT_LABELS)(
    'should store "fit" in place of the legacy Fit label "%s", keeping the other settings',
    async (label) => {
      const fake = await runMigrationsAgainst({
        schemaVersion: json(2),
        docs: json({ zoomValue: label, viewOnly: true, classroomSupport: true })
      });

      expect(fake.setCalls).toEqual([
        { docs: json({ zoomValue: "fit", viewOnly: true, classroomSupport: true }) }
      ]);
      expect(fake.data.schemaVersion).toBe(json(2));
    }
  );

  test.each(DOCS_FIT_LABELS)(
    'should store "fit" when V1 data holds the Fit label "%s"',
    async (label) => {
      const fake = await runMigrationsAgainst({ zoomValue: json(label) });

      expect(JSON.parse(fake.data.docs as string).zoomValue).toBe("fit");
      expect(fake.setCalls.map((call) => call.docs)).not.toContain(
        json({ zoomValue: label, viewOnly: false, classroomSupport: false })
      );
    }
  );

  test("should not write when the stored Docs zoom is already fit", async () => {
    const fake = await runMigrationsAgainst({
      schemaVersion: json(2),
      docs: json({ zoomValue: "fit", viewOnly: false, classroomSupport: false })
    });

    expect(fake.setCalls).toEqual([]);
  });

  test("should not write when storage is already current", async () => {
    const fake = await runMigrationsAgainst({ schemaVersion: json(2), docs: json(DOCS_150) });

    expect(fake.setCalls).toEqual([]);
    expect(fake.removeCalls).toEqual([]);
  });
});
