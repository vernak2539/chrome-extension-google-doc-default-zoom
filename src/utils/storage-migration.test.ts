import { describe, expect, test } from "vitest";

import { type V1FlatStorageData, type V2StorageData, migrateV1ToV2 } from "./storage-migration";

describe("migrateV1ToV2", () => {
  test("should migrate fully populated V1 data to V2 structure", () => {
    const v1Data: V1FlatStorageData = {
      zoomValue: "150%",
      "zoomValue:viewOnly": true,
      "zoomValue:classroomSupport": true,
      "sheets:zoomValue": "75%",
      "sheets:zoomValue:viewOnly": false,
      "sheets:zoomValue:classroomSupport": true
    };

    const result = migrateV1ToV2(v1Data);

    const expected: V2StorageData = {
      docs: {
        zoomValue: "150%",
        viewOnly: true,
        classroomSupport: true
      },
      sheets: {
        zoomValue: "75%",
        viewOnly: false,
        classroomSupport: true
      }
    };

    expect(result).toEqual(expected);
  });

  test("should use default values when V1 keys are missing", () => {
    const v1Data: V1FlatStorageData = {};

    const result = migrateV1ToV2(v1Data);

    const expected: V2StorageData = {
      docs: {
        zoomValue: "100%",
        viewOnly: false,
        classroomSupport: false
      },
      sheets: {
        zoomValue: "100%",
        viewOnly: false,
        classroomSupport: false
      }
    };

    expect(result).toEqual(expected);
  });

  test("should handle partial V1 data (only Docs zoom set)", () => {
    const v1Data: V1FlatStorageData = {
      zoomValue: "200%"
    };

    const result = migrateV1ToV2(v1Data);

    expect(result.docs.zoomValue).toBe("200%");
    expect(result.docs.viewOnly).toBe(false);
    expect(result.docs.classroomSupport).toBe(false);
    expect(result.sheets.zoomValue).toBe("100%");
    expect(result.sheets.viewOnly).toBe(false);
    expect(result.sheets.classroomSupport).toBe(false);
  });

  test("should handle partial V1 data (only Sheets zoom set)", () => {
    const v1Data: V1FlatStorageData = {
      "sheets:zoomValue": "50%"
    };

    const result = migrateV1ToV2(v1Data);

    expect(result.docs.zoomValue).toBe("100%");
    expect(result.sheets.zoomValue).toBe("50%");
  });

  test("should handle partial V1 data (only feature flags set)", () => {
    const v1Data: V1FlatStorageData = {
      "zoomValue:viewOnly": true,
      "sheets:zoomValue:classroomSupport": true
    };

    const result = migrateV1ToV2(v1Data);

    expect(result.docs.zoomValue).toBe("100%");
    expect(result.docs.viewOnly).toBe(true);
    expect(result.docs.classroomSupport).toBe(false);
    expect(result.sheets.zoomValue).toBe("100%");
    expect(result.sheets.viewOnly).toBe(false);
    expect(result.sheets.classroomSupport).toBe(true);
  });

  test("should treat undefined V1 boolean values as false", () => {
    const v1Data: V1FlatStorageData = {
      zoomValue: "125%",
      "zoomValue:viewOnly": undefined,
      "zoomValue:classroomSupport": undefined
    };

    const result = migrateV1ToV2(v1Data);

    expect(result.docs.viewOnly).toBe(false);
    expect(result.docs.classroomSupport).toBe(false);
  });

  test("should treat undefined V1 zoom values as default 100%", () => {
    const v1Data: V1FlatStorageData = {
      zoomValue: undefined,
      "sheets:zoomValue": undefined
    };

    const result = migrateV1ToV2(v1Data);

    expect(result.docs.zoomValue).toBe("100%");
    expect(result.sheets.zoomValue).toBe("100%");
  });
});
