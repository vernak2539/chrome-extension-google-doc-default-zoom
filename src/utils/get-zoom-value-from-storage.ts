import { sendToBackgroundViaRelay } from "@plasmohq/messaging"

import { RELAY_GET_ZOOM_VALUE_FROM_STORAGE } from "~constants"
import type { GetZoomValueRequestBody, GetZoomValueResponseBody } from "~types"

type GetZoomValueFromStorageSig = (storageKey: string) => Promise<string>

const getZoomValueFromStorage: GetZoomValueFromStorageSig = (storageKey) => {
  return new Promise((resolve) => {
    sendToBackgroundViaRelay<GetZoomValueRequestBody, GetZoomValueResponseBody>(
      {
        name: RELAY_GET_ZOOM_VALUE_FROM_STORAGE,
        body: { storageKey }
      }
    ).then((response) => {
      resolve(response.zoomValue)
    })
  })
}

export default getZoomValueFromStorage
