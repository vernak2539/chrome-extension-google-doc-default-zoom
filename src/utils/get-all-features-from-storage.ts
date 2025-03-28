import { sendToBackgroundViaRelay } from "@plasmohq/messaging";
import { RELAY_GET_ALL_FEATURES } from "src/constants";
import type {
  AppFeatures,
  GetAllFeaturesRequestBody,
  GetAllFeaturesResponseBody,
  WorkspaceAppName
} from "src/types";

export const getAllFeaturesFromStorage = (
  application: WorkspaceAppName
): Promise<AppFeatures> => {
  return new Promise((resolve) => {
    sendToBackgroundViaRelay<
      GetAllFeaturesRequestBody,
      GetAllFeaturesResponseBody
    >({
      name: RELAY_GET_ALL_FEATURES,
      body: {}
    }).then((response) => {
      resolve(response[application]);
    });
  });
};
