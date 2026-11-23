import { defineExtensionMessaging } from "@webext-core/messaging";
import type {
  AppStorageState,
  GetAppStorageStateRequestBody,
  ReportContentErrorRequestBody
} from "src/types";

interface ProtocolMap {
  getAppStorageState(data: GetAppStorageStateRequestBody): AppStorageState;
  reportContentError(data: ReportContentErrorRequestBody): object;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
