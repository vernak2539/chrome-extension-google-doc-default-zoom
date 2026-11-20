import { defineExtensionMessaging } from "@webext-core/messaging";
import type {
  AppStorageState,
  ExecuteEnterRequestBody,
  ExecuteEnterResponseBody,
  GetAppStorageStateRequestBody
} from "src/types";

interface ProtocolMap {
  getAppStorageState(data: GetAppStorageStateRequestBody): AppStorageState;
  executeEnter(data: ExecuteEnterRequestBody): ExecuteEnterResponseBody;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
