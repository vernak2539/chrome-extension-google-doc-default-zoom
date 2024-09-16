import type { PlasmoMessaging } from "@plasmohq/messaging";
import { Storage } from "@plasmohq/storage";

import type {
  GetZoomValueRequestBody,
  GetZoomValueResponseBody
} from "../../types";
import { setupSentry } from "../../utils/sentry/background";

const sentryClient = setupSentry("background");

const storage = new Storage();

const handler: PlasmoMessaging.MessageHandler<
  GetZoomValueRequestBody,
  GetZoomValueResponseBody
> = async (req, res) => {
  try {
    const zoomValue = await storage.get<string>(req.body.storageKey);

    res.send({
      zoomValue
    });
  } catch (err) {
    sentryClient.captureException(err);
  }
};

export default handler;
