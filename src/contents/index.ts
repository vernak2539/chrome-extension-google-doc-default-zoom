import type { PlasmoCSConfig } from "plasmo"

import { relayMessage, sendToBackgroundViaRelay } from "@plasmohq/messaging"

import { OBSERVE_EXECUTION_LIMIT } from "~constants"
import counterFactory from "~counter-factory"
import DocsStrategy from "~strategies/docs"
import type { GetZoomValueRequestBody, GetZoomValueResponseBody } from "~types"

export const config: PlasmoCSConfig = {
  matches: ["https://docs.google.com/*"]
}

// create and "register" the relay
relayMessage({
  name: "get-zoom-value"
})

const strategy = new DocsStrategy({ isViewOnly: false })

const getZoomValue: () => Promise<string> = () => {
  return new Promise((resolve) => {
    sendToBackgroundViaRelay<GetZoomValueRequestBody, GetZoomValueResponseBody>(
      { name: "get-zoom-value", body: { storageKey: strategy.STORAGE_KEY } }
    ).then((response) => {
      resolve(response.zoomValue)
    })
  })
}

const counter = counterFactory()
const observer = new MutationObserver((_mutationList, observer) => {
  const zoomIsDisabled = strategy.getIsZoomSelectorDisabled()
  const isExecutionCountOverLimit = counter.getCount() > OBSERVE_EXECUTION_LIMIT

  if (isExecutionCountOverLimit) {
    observer.disconnect()
    return
  }

  if (!zoomIsDisabled) {
    getZoomValue().then((zoomValue) => {
      strategy.execute(zoomValue)
    })

    observer.disconnect()
  }

  counter.increment()
})

// initial kick-off
const zoomIsDisabled = strategy.getIsZoomSelectorDisabled()

if (zoomIsDisabled) {
  observer.observe(document.getElementById("docs-toolbar"), {
    attributes: true,
    childList: true
  })
} else {
  getZoomValue().then((zoomValue) => {
    strategy.execute(zoomValue)
  })
}
