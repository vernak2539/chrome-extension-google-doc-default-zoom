import type { PlasmoMessaging } from "@plasmohq/messaging";
import { Storage } from "@plasmohq/storage";
import type {
  GetFeatureViewOnlyRequestBody,
  GetFeatureViewOnlyResponseBody
} from "src/types";
import { createSentryClient } from "src/utils/sentry/background-script";

const storage = new Storage();
const sentryClient = createSentryClient();

const handler: PlasmoMessaging.MessageHandler<
  GetFeatureViewOnlyRequestBody,
  GetFeatureViewOnlyResponseBody
> = async (req, res) => {
  try {
    const enabled = await storage.get<boolean>(req.body.storageKey);

    res.send({
      enabled
    });
  } catch (err) {
    sentryClient.captureException(err);
  }
};

export default handler;
