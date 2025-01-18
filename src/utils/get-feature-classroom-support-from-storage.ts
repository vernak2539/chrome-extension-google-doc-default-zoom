import { sendToBackgroundViaRelay } from "@plasmohq/messaging";
import type {
  GetFeatureClassroomSupportRequestBody,
  GetFeatureClassroomSupportResponseBody,
  GetFromStorageFn
} from "src/types";
import { RELAY_GET_FEATURE_CLASSROOM_SUPPORT_FROM_STORAGE } from "../constants";

export const getFeatureClassroomSupportFromStorage: GetFromStorageFn<
  boolean
> = (storageKey: string) => {
  console.log("getFeatureClassroomSupportFromStorage", storageKey);
  return new Promise((resolve) => {
    sendToBackgroundViaRelay<
      GetFeatureClassroomSupportRequestBody,
      GetFeatureClassroomSupportResponseBody
    >({
      name: RELAY_GET_FEATURE_CLASSROOM_SUPPORT_FROM_STORAGE,
      body: { storageKey }
    }).then((response) => {
      console.log("response", response);
      resolve(response.enabled);
    });
  });
};
