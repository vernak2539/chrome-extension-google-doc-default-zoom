import { defineExtensionMessaging } from "@webext-core/messaging";
import type {
  AppStorageState,
  ExecuteEnterRequestBody,
  ExecuteEnterResponseBody,
  GetAppStorageStateRequestBody,
  ReportContentErrorRequestBody
} from "src/types";

interface ProtocolMap {
  getAppStorageState(data: GetAppStorageStateRequestBody): AppStorageState;
  executeEnter(data: ExecuteEnterRequestBody): ExecuteEnterResponseBody;
  reportContentError(data: ReportContentErrorRequestBody): object;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
