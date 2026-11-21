import { createSentryClient } from "src/utils/sentry/base";
import { CURRENT_SCHEMA_VERSION, decodeStoredValue } from "src/utils/storage";
import {
  migrateV1ToV2,
  V1_STORAGE_KEYS,
  type V1FlatStorageData,
  type V2StorageData
} from "src/utils/storage-migration";
import { storage, type StorageItemKey } from "wxt/utils/storage";

const sentryScope = createSentryClient("background");

const V2_APP_KEYS = ["docs", "sheets"] as const;
// Plasmo saved these as JSON text, so a string here is an old value that has to be rewritten
const LEGACY_JSON_KEYS = [...V2_APP_KEYS, "schemaVersion"];

// Every step below is safe to run again. The V2 values and the schema version go out in one write,
// and the V1 keys are removed after it, so an interrupted run leaves either the old V1 keys alone
// or the new values plus leftover V1 keys. The leftovers are removed on the next run and never
// replace a stored V2 value.
async function runMigrations() {
  const keys = [...V1_STORAGE_KEYS, ...LEGACY_JSON_KEYS];
  const items = await storage.getItems(keys.map((key) => `sync:${key}` as StorageItemKey));
  const raw = Object.fromEntries(
    items.map(({ key, value }) => [key.replace(/^sync:/, ""), value])
  ) as Record<string, unknown>;
  const stored = Object.fromEntries(
    keys.map((key) => [key, decodeStoredValue(raw[key])])
  ) as Record<string, unknown>;

  const currentVersion = (stored.schemaVersion as number | undefined) ?? 0;
  const leftoverV1Keys = V1_STORAGE_KEYS.filter((key) => stored[key] != null);
  const writes: Record<string, unknown> = {};

  if (currentVersion < CURRENT_SCHEMA_VERSION) {
    if (leftoverV1Keys.length === 0) {
      // Nothing to migrate. Defaults are not written; readers fill them in.
      writes.schemaVersion = CURRENT_SCHEMA_VERSION;
    } else {
      const v1Data = Object.fromEntries(
        leftoverV1Keys.map((key) => [key, stored[key]])
      ) as V1FlatStorageData;
      const v2Data = migrateV1ToV2(v1Data, stored as Partial<V2StorageData>);

      Object.assign(writes, v2Data);
      writes.schemaVersion = CURRENT_SCHEMA_VERSION;
    }
  }

  // Rewrite JSON text that Plasmo saved, even when the schema version is already current
  for (const key of LEGACY_JSON_KEYS) {
    if (!(key in writes) && typeof raw[key] === "string") {
      writes[key] = stored[key];
    }
  }

  if (Object.keys(writes).length > 0) {
    await storage.setItems(
      Object.entries(writes).map(([key, value]) => ({
        key: `sync:${key}` as StorageItemKey,
        value
      }))
    );
  }

  if (leftoverV1Keys.length > 0) {
    await storage.removeItems(leftoverV1Keys.map((key) => `sync:${key}` as StorageItemKey));
  }
}

export const migrationsReady = runMigrations().catch((error) => {
  console.error("Failed to run storage migrations", error);
  sentryScope.captureException(error);
  // Do not re-throw — handlers await this promise and a permanent rejection
  // would break all background messaging after a single migration error.
});
