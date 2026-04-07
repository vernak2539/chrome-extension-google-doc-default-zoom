import type { PlasmoMessaging } from "@plasmohq/messaging";
import { Storage } from "@plasmohq/storage";
import type {
  AppStorageState,
  GetFeatureClassroomSupportRequestBody,
  GetFeatureClassroomSupportResponseBody
} from "src/types";
import { createSentryClient } from "src/utils/sentry/base";

const storage = new Storage();
const sentryScope = createSentryClient("background");

const handler: PlasmoMessaging.MessageHandler<
  GetFeatureClassroomSupportRequestBody,
  GetFeatureClassroomSupportResponseBody
> = async (req, res) => {
  try {
    const appState = await storage.get<AppStorageState>(req.body.storageKey);

    res.send({
      enabled: appState?.classroomSupport ?? false
    });
  } catch (err) {
    sentryScope.captureException(err);
  }
};

export default handler;
