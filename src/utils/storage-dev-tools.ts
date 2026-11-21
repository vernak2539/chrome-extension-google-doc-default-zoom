import { APPS, getDefaultAppState } from "src/constants";
import type { AppStorageState } from "src/types";
import { appStateKey, readStoredValue, SCHEMA_VERSION_KEY } from "src/utils/storage";
import { storage, type StorageItemKey } from "wxt/utils/storage";

const appStorageKeys = Object.keys(APPS) as (keyof typeof APPS)[];

/** Writes the defaults for every app, the same state the settings reset button leaves. */
export const resetStorageToDefaults = () =>
  storage.setItems(
    appStorageKeys.map((key) => ({
      key: appStateKey(key),
      value: getDefaultAppState(key)
    }))
  );

/**
 * Rewrites the current settings in the format the Plasmo versions used: every sync value is JSON
 * text and the schema version is the string "2". Reloading the extension then exercises the
 * upgrade path (decode on read, then the background migration writes plain values).
 */
export const writeStorageInLegacyFormat = async () => {
  const currentStates = await Promise.all(
    appStorageKeys.map((key) => readStoredValue<AppStorageState>(appStateKey(key)))
  );

  const writes: { key: StorageItemKey; value: string }[] = appStorageKeys.map((key, index) => ({
    key: appStateKey(key),
    value: JSON.stringify(currentStates[index] ?? getDefaultAppState(key))
  }));
  writes.push({ key: SCHEMA_VERSION_KEY, value: JSON.stringify(2) });

  await storage.setItems(writes);
};
