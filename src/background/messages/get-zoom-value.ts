import type { PlasmoMessaging } from "@plasmohq/messaging";
import { Storage } from "@plasmohq/storage";
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
    const appState = await storage.get<AppStorageState>(req.body.storageKey);

    res.send({
      zoomValue: appState?.zoomValue ?? ""
    });
  } catch (err) {
    sentryScope.captureException(err);
  }
};

export default handler;
