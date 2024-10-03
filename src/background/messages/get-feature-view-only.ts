import type { PlasmoMessaging } from "@plasmohq/messaging";
import { Storage } from "@plasmohq/storage";
import type {
  GetFeatureViewOnlyRequestBody,
  GetFeatureViewOnlyResponseBody
} from "src/types";
import { createSentryClient } from "src/utils/sentry/base";

const storage = new Storage();
const sentryScope = createSentryClient("background");

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
    sentryScope.captureException(err);
  }
};

export default handler;
