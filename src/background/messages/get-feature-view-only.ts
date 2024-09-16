import type { PlasmoMessaging } from "@plasmohq/messaging";
import { Storage } from "@plasmohq/storage";

import type {
  GetFeatureViewOnlyRequestBody,
  GetFeatureViewOnlyResponseBody
} from "../../types";
import { setupSentry } from "../../utils/sentry/background";

const sentryClient = setupSentry("background");

const storage = new Storage();

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
