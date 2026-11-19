import type { PlasmoMessaging } from "@plasmohq/messaging";
import { getDefaultAppState } from "src/constants";
import type { AppStorageState, GetAppStorageStateRequestBody } from "src/types";
import { migrationsReady } from "src/utils/migrations";
import { createSentryClient } from "src/utils/sentry/base";
import { storage } from "src/utils/storage";

const sentryScope = createSentryClient("background");

const handler: PlasmoMessaging.MessageHandler<
  GetAppStorageStateRequestBody,
  AppStorageState
> = async (req, res) => {
  const storageKey = req.body?.storageKey;
  const defaultState = getDefaultAppState(storageKey);

  try {
    if (storageKey === undefined) {
      throw new Error("Message is missing the storage key");
    }

    await migrationsReady;
    const appState = await storage.get<AppStorageState>(storageKey);

    res.send({
      zoomValue: appState?.zoomValue ?? defaultState.zoomValue,
      viewOnly: appState?.viewOnly ?? defaultState.viewOnly,
      classroomSupport: appState?.classroomSupport ?? defaultState.classroomSupport
    });
  } catch (err) {
    sentryScope.captureException(err);
    res.send(defaultState);
  }
};

export default handler;
