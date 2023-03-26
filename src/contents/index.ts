import type { PlasmoCSConfig } from "plasmo"

import { relayMessage, sendToBackgroundViaRelay } from "@plasmohq/messaging"

import {
  OBSERVE_EXECUTION_LIMIT,
  RELAY_GET_ZOOM_VALUE_FROM_STORAGE
} from "~constants"
import counterFactory from "~counter-factory"
import DocsStrategy from "~strategies/docs"
import Logger from "~utils/logger"

export const config: PlasmoCSConfig = {
  matches: ["https://docs.google.com/*"]
}

const logger = new Logger()

// create and "register" the relay
relayMessage({ name: RELAY_GET_ZOOM_VALUE_FROM_STORAGE })

const strategy = new DocsStrategy({ isViewOnly: false })
logger.setWorkplaceApp("Docs")

const counter = counterFactory()
const observer = new MutationObserver((_mutationList, observer) => {
  const zoomIsDisabled = strategy.getIsZoomSelectorDisabled()
  const isExecutionCountOverLimit = counter.getCount() > OBSERVE_EXECUTION_LIMIT

  if (isExecutionCountOverLimit) {
    observer.disconnect()
    return
  }

  if (!zoomIsDisabled) {
    observer.disconnect()
    strategy.execute().then(() => {
      console.log("Zoom executed. Method: observer")
    })
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
  strategy.execute().then(() => {
    console.log("Zoom executed. Method: inline")
  })
}
