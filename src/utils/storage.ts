import { storage, type StorageItemKey } from "wxt/utils/storage";

export const SCHEMA_VERSION_KEY = "sync:schemaVersion" satisfies StorageItemKey;
export const CURRENT_SCHEMA_VERSION = 2;

export const appStateKey = (storageKey: string): StorageItemKey => `sync:${storageKey}`;

// Versions built with Plasmo saved each value as JSON text, and a synced device that hasn't updated may still write it
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

export const readStoredValue = async <T>(key: StorageItemKey): Promise<T | null> =>
  decodeStoredValue(await storage.getItem(key)) as T | null;

export const watchStoredValue = <T>(
  key: StorageItemKey,
  callback: (value: T | null) => void
): (() => void) =>
  storage.watch<unknown>(key, (value) => callback(decodeStoredValue(value) as T | null));
