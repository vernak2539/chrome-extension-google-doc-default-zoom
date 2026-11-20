import "src/utils/migrations"; // starts the storage migration when the background starts
import { onMessage } from "src/utils/messaging";

import { executeEnter } from "./execute-enter";
import { getAppStorageState } from "./get-app-storage-state";
import { reportContentError } from "./report-content-error";

export const startBackground = () => {
  onMessage("getAppStorageState", ({ data }) => getAppStorageState(data));
  onMessage("executeEnter", ({ data, sender }) => executeEnter(data, sender));
  onMessage("reportContentError", ({ data, sender }) => reportContentError(data, sender.url));
};
