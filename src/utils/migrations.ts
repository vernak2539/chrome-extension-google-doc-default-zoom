import { Storage } from "@plasmohq/storage";
import { createSentryClient } from "src/utils/sentry/base";
import {
  CURRENT_SCHEMA_VERSION,
  migrateV1ToV2,
  SCHEMA_VERSION_KEY,
  V1_STORAGE_KEYS,
  type V1FlatStorageData
} from "src/utils/storage-migration";

const storage = new Storage();
const sentryScope = createSentryClient("background");

async function hasExistingV1Data() {
  for (const key of V1_STORAGE_KEYS) {
    const value = await storage.get(key);
    if (value !== undefined) {
      return true;
    }
  }
  return false;
}

async function migrateToV2() {
  // Read all V1 flat keys
  const v1Data: V1FlatStorageData = {};

  for (const key of V1_STORAGE_KEYS) {
    const value = await storage.get(key);
    if (value !== undefined) {
      (v1Data as Record<string, unknown>)[key] = value;
    }
  }

  // Transform to V2 structure
  const v2Data = migrateV1ToV2(v1Data);

  // Write the new per-application objects
  await storage.set("docs", v2Data.docs);
  await storage.set("sheets", v2Data.sheets);

  // Clean up old flat keys
  for (const key of V1_STORAGE_KEYS) {
    await storage.remove(key);
  }
}

async function runMigrations() {
  const currentVersion =
    (await storage.get<number>(SCHEMA_VERSION_KEY)) ?? 0;

  if (currentVersion < CURRENT_SCHEMA_VERSION) {
    if (await hasExistingV1Data()) {
      await migrateToV2();
    }
    
    await storage.set(SCHEMA_VERSION_KEY, CURRENT_SCHEMA_VERSION);
  }
}

export const migrationsReady = runMigrations().catch((error) => {
  console.error("Failed to run storage migrations", error);
  sentryScope.captureException(error);
  // Do not re-throw — handlers await this promise and a permanent rejection
  // would break all background messaging after a single migration error.
});
