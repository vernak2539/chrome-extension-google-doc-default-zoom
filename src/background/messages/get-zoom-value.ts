import type { PlasmoMessaging } from "@plasmohq/messaging";
import { Storage } from "@plasmohq/storage";
import { workspaceApps } from "src/constants";
import type { AppStorageState, GetZoomValueRequestBody, GetZoomValueResponseBody } from "src/types";
import { migrationsReady } from "src/utils/migrations";
import { createSentryClient } from "src/utils/sentry/base";

const storage = new Storage();
const sentryScope = createSentryClient("background");

const handler: PlasmoMessaging.MessageHandler<
  GetZoomValueRequestBody,
  GetZoomValueResponseBody
> = async (req, res) => {
  const defaultZoom =
    workspaceApps.find((app) => app.storageKey === req.body.storageKey)?.defaultZoom ?? "100%";

  try {
    await migrationsReady;
    const appState = await storage.get<AppStorageState>(req.body.storageKey);

    res.send({
      zoomValue: appState?.zoomValue ?? defaultZoom
    });
  } catch (err) {
    sentryScope.captureException(err);
    res.send({ zoomValue: defaultZoom });
  }
};

export default handler;
