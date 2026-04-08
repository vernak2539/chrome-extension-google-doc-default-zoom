import type { PlasmoMessaging } from "@plasmohq/messaging";
import { Storage } from "@plasmohq/storage";
import { migrationsReady } from "src/background/index";
import { workspaceApps } from "src/constants";
import type {
  AppStorageState,
  GetZoomValueRequestBody,
  GetZoomValueResponseBody
} from "src/types";
import { createSentryClient } from "src/utils/sentry/base";

const storage = new Storage();
const sentryScope = createSentryClient("background");

const handler: PlasmoMessaging.MessageHandler<
  GetZoomValueRequestBody,
  GetZoomValueResponseBody
> = async (req, res) => {
  try {
    await migrationsReady;
    const appState = await storage.get<AppStorageState>(req.body.storageKey);
    const defaultZoom = workspaceApps.find((app) => app.storageKey === req.body.storageKey)?.defaultZoom ?? "100%";

    res.send({
      zoomValue: appState?.zoomValue ?? defaultZoom
    });
  } catch (err) {
    sentryScope.captureException(err);
  }
};

export default handler;
