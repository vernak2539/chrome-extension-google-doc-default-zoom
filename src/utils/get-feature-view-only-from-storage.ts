import { sendToBackgroundViaRelay } from "@plasmohq/messaging"

import { RELAY_GET_FEATURE_VIEW_ONLY_FROM_STORAGE } from "../constants"
import type {
  GetFeatureViewOnlyRequestBody,
  GetFeatureViewOnlyResponseBody,
  GetFromStorageFn
} from "../types"

export const getFeatureViewOnlyFromStorage: GetFromStorageFn<boolean> = (
  storageKey
) => {
  return new Promise((resolve) => {
    sendToBackgroundViaRelay<
      GetFeatureViewOnlyRequestBody,
      GetFeatureViewOnlyResponseBody
    >({
      name: RELAY_GET_FEATURE_VIEW_ONLY_FROM_STORAGE,
      body: { storageKey }
    }).then((response) => {
      resolve(response.enabled)
    })
  })
}
