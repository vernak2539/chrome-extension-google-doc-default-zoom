/**
 * Storage migration utilities for converting between schema versions.
 *
 * V1 (flat keys):
 *   "zoomValue"                       -> Docs zoom value
 *   "zoomValue:viewOnly"              -> Docs view-only feature flag
 *   "zoomValue:classroomSupport"      -> Docs classroom support feature flag
 *   "sheets:zoomValue"                -> Sheets zoom value
 *   "sheets:zoomValue:viewOnly"       -> Sheets view-only feature flag
 *   "sheets:zoomValue:classroomSupport" -> Sheets classroom support feature flag
 *
 * V2 (per-application objects):
 *   "docs"  -> { zoomValue, viewOnly, classroomSupport }
 *   "sheets" -> { zoomValue, viewOnly, classroomSupport }
 *   "schemaVersion" -> 2
 */

import type { AppStorageState } from "src/types";

export interface V1FlatStorageData {
  zoomValue?: string;
  "zoomValue:viewOnly"?: boolean;
  "zoomValue:classroomSupport"?: boolean;
  "sheets:zoomValue"?: string;
  "sheets:zoomValue:viewOnly"?: boolean;
  "sheets:zoomValue:classroomSupport"?: boolean;
}

export interface V2StorageData {
  docs: AppStorageState;
  sheets: AppStorageState;
}

const DEFAULT_ZOOM = "100%";

export function migrateV1ToV2(v1Data: V1FlatStorageData): V2StorageData {
  return {
    docs: {
      zoomValue: v1Data["zoomValue"] ?? DEFAULT_ZOOM,
      viewOnly: v1Data["zoomValue:viewOnly"] ?? false,
      classroomSupport: v1Data["zoomValue:classroomSupport"] ?? false
    },
    sheets: {
      zoomValue: v1Data["sheets:zoomValue"] ?? DEFAULT_ZOOM,
      viewOnly: v1Data["sheets:zoomValue:viewOnly"] ?? false,
      classroomSupport: v1Data["sheets:zoomValue:classroomSupport"] ?? false
    }
  };
}

/** The V1 flat storage keys that should be cleaned up after migration */
export const V1_STORAGE_KEYS = [
  "zoomValue",
  "zoomValue:viewOnly",
  "zoomValue:classroomSupport",
  "sheets:zoomValue",
  "sheets:zoomValue:viewOnly",
  "sheets:zoomValue:classroomSupport"
] as const;

export const SCHEMA_VERSION_KEY = "schemaVersion";
export const CURRENT_SCHEMA_VERSION = 2;
