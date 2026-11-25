import { storage, type StorageItemKey } from "wxt/utils/storage";

export const SCHEMA_VERSION_KEY = "sync:schemaVersion" satisfies StorageItemKey;
export const CURRENT_SCHEMA_VERSION = 2;

export const appStateKey = (storageKey: string): StorageItemKey => `sync:${storageKey}`;

// Accepts JSON text, the format every released version writes, and a plain value, which builds from before
// `encodeStoredValue` wrote (they were never released, but a developer's synced devices may hold them)
export const decodeStoredValue = (value: unknown): unknown => {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

/**
 * Settings are written as JSON text, the format the Plasmo versions (v0.15.4 and earlier) read. Sync carries every
 * write to the user's other devices, and one that hasn't updated yet reads each value with `JSON.parse`: a plain
 * object comes back as nothing, so it applies the default zoom, and opening its popup saves those defaults over the
 * user's settings on every device. Reads accept both formats (`decodeStoredValue`), so writes can switch to plain
 * values once no Plasmo version is in use. The background migration rewrites any plain value it finds as JSON text.
 */
export const encodeStoredValue = (value: unknown): string => JSON.stringify(value);

export const readStoredValue = async <T>(key: StorageItemKey): Promise<T | null> =>
  decodeStoredValue(await storage.getItem(key)) as T | null;

export const writeStoredValue = (key: StorageItemKey, value: unknown): Promise<void> =>
  storage.setItem(key, encodeStoredValue(value));

// One `chrome.storage` call for all of them, so the values arrive together
export const writeStoredValues = (
  items: { key: StorageItemKey; value: unknown }[]
): Promise<void> =>
  storage.setItems(items.map(({ key, value }) => ({ key, value: encodeStoredValue(value) })));

export const watchStoredValue = <T>(
  key: StorageItemKey,
  callback: (value: T | null) => void
): (() => void) =>
  storage.watch<unknown>(key, (value) => callback(decodeStoredValue(value) as T | null));
