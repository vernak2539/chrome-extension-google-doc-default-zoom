import { sendToBackgroundViaRelay } from "@plasmohq/messaging";

import { RELAY_GET_APP_STORAGE_STATE } from "../constants";
import type { AppStorageState, GetAppStorageStateRequestBody, GetFromStorageFn } from "../types";

const getAppStorageStateFromStorage: GetFromStorageFn<AppStorageState> = (storageKey) => {
  return new Promise((resolve) => {
    sendToBackgroundViaRelay<GetAppStorageStateRequestBody, AppStorageState>({
      name: RELAY_GET_APP_STORAGE_STATE,
      body: { storageKey }
    }).then((response) => {
      resolve(response);
    });
  });
};

export default getAppStorageStateFromStorage;
