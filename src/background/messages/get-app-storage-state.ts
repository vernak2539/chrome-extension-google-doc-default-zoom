import type { PlasmoMessaging } from "@plasmohq/messaging";
import { Storage } from "@plasmohq/storage";
import { workspaceApps } from "src/constants";
import type { AppStorageState, GetAppStorageStateRequestBody } from "src/types";
import { migrationsReady } from "src/utils/migrations";
import { createSentryClient } from "src/utils/sentry/base";

const storage = new Storage();
const sentryScope = createSentryClient("background");

const handler: PlasmoMessaging.MessageHandler<
  GetAppStorageStateRequestBody,
  AppStorageState
> = async (req, res) => {
  const defaultZoom =
    workspaceApps.find((app) => app.storageKey === req.body.storageKey)?.defaultZoom ?? "100%";

  const defaultState: AppStorageState = {
    zoomValue: defaultZoom,
    viewOnly: false,
    classroomSupport: false
  };

  try {
    await migrationsReady;
    const appState = await storage.get<AppStorageState>(req.body.storageKey);

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
