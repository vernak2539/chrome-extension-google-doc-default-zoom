import type { AppStorageState, GetFromStorageFn } from "../types";
import { sendMessage } from "./messaging";

const getAppStorageStateFromStorage: GetFromStorageFn<AppStorageState> = async (storageKey) => {
  return await sendMessage("getAppStorageState", { storageKey });
};

export default getAppStorageStateFromStorage;
