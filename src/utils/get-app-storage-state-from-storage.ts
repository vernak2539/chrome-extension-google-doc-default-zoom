import { sendToBackgroundViaRelay } from "@plasmohq/messaging";

import { RELAY_GET_APP_STORAGE_STATE } from "../constants";
import type { AppStorageState, GetAppStorageStateRequestBody, GetFromStorageFn } from "../types";

const getAppStorageStateFromStorage: GetFromStorageFn<AppStorageState> = async (storageKey) => {
  return await sendToBackgroundViaRelay<GetAppStorageStateRequestBody, AppStorageState>({
    name: RELAY_GET_APP_STORAGE_STATE,
    body: { storageKey }
  });
};

export default getAppStorageStateFromStorage;
