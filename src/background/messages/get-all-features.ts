import type { PlasmoMessaging } from "@plasmohq/messaging";
import { Storage } from "@plasmohq/storage";
import {
  DOCS_STORAGE_KEY,
  SHEETS_STORAGE_KEY,
  getFeatureClassroomSupportStorageKey,
  getFeatureViewOnlyStorageKey
} from "src/constants";
import type {
  GetAllFeaturesRequestBody,
  GetAllFeaturesResponseBody
} from "src/types";
import { createSentryClient } from "src/utils/sentry/base";

const storage = new Storage();
const sentryScope = createSentryClient("background");

const handler: PlasmoMessaging.MessageHandler<
  GetAllFeaturesRequestBody,
  GetAllFeaturesResponseBody
> = async (req, res) => {
  try {
    const [docsViewOnly, docsClassroom, sheetsViewOnly, sheetsClassroom] =
      await Promise.all([
        storage.get<boolean>(getFeatureViewOnlyStorageKey(DOCS_STORAGE_KEY)),
        storage.get<boolean>(
          getFeatureClassroomSupportStorageKey(DOCS_STORAGE_KEY)
        ),
        storage.get<boolean>(getFeatureViewOnlyStorageKey(SHEETS_STORAGE_KEY)),
        storage.get<boolean>(
          getFeatureClassroomSupportStorageKey(SHEETS_STORAGE_KEY)
        )
      ]);

    res.send({
      Docs: {
        enableViewOnlyToggle: docsViewOnly || false,
        classroomSupport: docsClassroom || false
      },
      Sheets: {
        enableViewOnlyToggle: sheetsViewOnly || false,
        classroomSupport: sheetsClassroom || false
      }
    });
  } catch (err) {
    sentryScope.captureException(err);
  }
};

export default handler;
