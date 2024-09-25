import type { PlasmoMessaging } from "@plasmohq/messaging";
import { Storage } from "@plasmohq/storage";
import type {
  GetZoomValueRequestBody,
  GetZoomValueResponseBody
} from "src/types";
import { createSentryClient } from "src/utils/sentry/background-script";

const storage = new Storage();
const sentryClient = createSentryClient();

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
