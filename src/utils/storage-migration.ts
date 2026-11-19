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
 *
 * The migration is safe to run again after an interruption (see src/utils/migrations.ts): a V2 app
 * object that is already stored always wins over V1 keys.
 */

import { fillAppState } from "src/constants";
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

/**
 * @param current V2 app objects that are already stored. They are kept as they are, so a rerun
 * after an interrupted migration does not replace saved values with V1 values or defaults.
 */
export function migrateV1ToV2(
  v1Data: V1FlatStorageData,
  current: Partial<V2StorageData> = {}
): V2StorageData {
  return {
    docs:
      current.docs ??
      fillAppState("docs", {
        zoomValue: v1Data["zoomValue"],
        viewOnly: v1Data["zoomValue:viewOnly"],
        classroomSupport: v1Data["zoomValue:classroomSupport"]
      }),
    sheets:
      current.sheets ??
      fillAppState("sheets", {
        zoomValue: v1Data["sheets:zoomValue"],
        viewOnly: v1Data["sheets:zoomValue:viewOnly"],
        classroomSupport: v1Data["sheets:zoomValue:classroomSupport"]
      })
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
