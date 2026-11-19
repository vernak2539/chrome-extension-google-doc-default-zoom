import { DOCS_STORAGE_KEY, toStableZoomValue } from "src/constants";
import type { AppStorageState } from "src/types";
import { createSentryClient } from "src/utils/sentry/base";
import { CURRENT_SCHEMA_VERSION, SCHEMA_VERSION_KEY, storage } from "src/utils/storage";
import {
  migrateV1ToV2,
  V1_STORAGE_KEYS,
  type V1FlatStorageData,
  type V2StorageData
} from "src/utils/storage-migration";

const sentryScope = createSentryClient("background");

// Older versions stored the translated Docs "Fit" label as the zoom value. Store the stable `"fit"`
// instead, without a schema version bump: the shape is unchanged and a stored `"fit"` is not touched.
// It updates `stored`, so the V1 step below does not write the old label again.
async function rewriteLegacyFitLabel(stored: Record<string, unknown>) {
  const docs = stored[DOCS_STORAGE_KEY] as Partial<AppStorageState> | undefined;
  if (typeof docs?.zoomValue !== "string") {
    return;
  }

  const zoomValue = toStableZoomValue(docs.zoomValue);
  if (zoomValue === docs.zoomValue) {
    return;
  }

  stored[DOCS_STORAGE_KEY] = { ...docs, zoomValue };
  await storage.set(DOCS_STORAGE_KEY, stored[DOCS_STORAGE_KEY]);
}

// Every step below is safe to run again. The V2 values and the schema version go out in one write,
// and the V1 keys are removed after it, so an interrupted run leaves either the old V1 keys alone
// or the new values plus leftover V1 keys. The leftovers are removed on the next run and never
// replace a stored V2 value.
async function runMigrations() {
  const stored = await storage.getMany<unknown>([
    ...V1_STORAGE_KEYS,
    "docs",
    "sheets",
    SCHEMA_VERSION_KEY
  ]);

  await rewriteLegacyFitLabel(stored);

  const currentVersion = (stored[SCHEMA_VERSION_KEY] as number | undefined) ?? 0;
  const leftoverV1Keys = V1_STORAGE_KEYS.filter((key) => stored[key] !== undefined);

  if (currentVersion < CURRENT_SCHEMA_VERSION) {
    if (leftoverV1Keys.length === 0) {
      // Nothing to migrate. Defaults are not written; readers fill them in.
      await storage.set(SCHEMA_VERSION_KEY, CURRENT_SCHEMA_VERSION);
      return;
    }

    const v1Data = Object.fromEntries(
      leftoverV1Keys.map((key) => [key, stored[key]])
    ) as V1FlatStorageData;
    const v2Data = migrateV1ToV2(v1Data, stored as Partial<V2StorageData>);

    await storage.setMany({ ...v2Data, [SCHEMA_VERSION_KEY]: CURRENT_SCHEMA_VERSION });
  }

  if (leftoverV1Keys.length > 0) {
    await storage.removeMany([...leftoverV1Keys]);
  }
}

export const migrationsReady = runMigrations().catch((error) => {
  console.error("Failed to run storage migrations", error);
  sentryScope.captureException(error);
  // Do not re-throw — handlers await this promise and a permanent rejection
  // would break all background messaging after a single migration error.
});
