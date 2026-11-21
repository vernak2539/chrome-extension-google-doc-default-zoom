import { fillAppState, getDefaultAppState } from "src/constants";
import type { AppStorageState, GetAppStorageStateRequestBody } from "src/types";
import { migrationsReady } from "src/utils/migrations";
import { createSentryClient } from "src/utils/sentry/base";
import { appStateKey, readStoredValue } from "src/utils/storage";

const sentryScope = createSentryClient("background");

export const getAppStorageState = async (
  body: GetAppStorageStateRequestBody | undefined
): Promise<AppStorageState> => {
  const storageKey = body?.storageKey;
  const defaultState = getDefaultAppState(storageKey);

  try {
    if (storageKey === undefined) {
      throw new Error("Message is missing the storage key");
    }

    await migrationsReady;
    const appState = await readStoredValue<AppStorageState>(appStateKey(storageKey));

    return fillAppState(storageKey, appState);
  } catch (err) {
    sentryScope.captureException(err);
    return defaultState;
  }
};
