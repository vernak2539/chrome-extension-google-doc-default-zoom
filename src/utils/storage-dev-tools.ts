import { APPS, getDefaultAppState } from "src/constants";
import type { AppStorageState } from "src/types";
import {
  appStateKey,
  CURRENT_SCHEMA_VERSION,
  readStoredValue,
  SCHEMA_VERSION_KEY,
  writeStoredValues
} from "src/utils/storage";
import { storage, type StorageItemKey } from "wxt/utils/storage";

const appStorageKeys = Object.keys(APPS) as (keyof typeof APPS)[];

/** Writes the defaults for every app, the same state the settings reset button leaves. */
export const resetStorageToDefaults = () =>
  writeStoredValues(
    appStorageKeys.map((key) => ({
      key: appStateKey(key),
      value: getDefaultAppState(key)
    }))
  );

/**
 * Rewrites the current settings as plain values, the format builds wrote before settings went back to JSON text (see
 * `encodeStoredValue`). Reloading the extension then exercises the conversion: reads still decode them, and the
 * background migration writes them as JSON text again.
 */
export const writeStorageAsPlainValues = async () => {
  const currentStates = await Promise.all(
    appStorageKeys.map((key) => readStoredValue<AppStorageState>(appStateKey(key)))
  );

  const writes: { key: StorageItemKey; value: unknown }[] = appStorageKeys.map((key, index) => ({
    key: appStateKey(key),
    value: currentStates[index] ?? getDefaultAppState(key)
  }));
  writes.push({ key: SCHEMA_VERSION_KEY, value: CURRENT_SCHEMA_VERSION });

  // Bypasses `writeStoredValues` on purpose: it would encode them
  await storage.setItems(writes);
};
