import type { PlasmoCSConfig } from "plasmo"

import { relay, sendViaRelay } from "@plasmohq/messaging"

import {
  CLICKABLE_ZOOM_OPTION_CLASS,
  CLICKABLE_ZOOM_SELECT_ID,
  DEFAULT_ZOOM,
  OBSERVE_EXECUTION_LIMIT
} from "~constants"
import counterFactory from "~counter-factory"
import {
  getDOMElement,
  getDOMElementCoordinates,
  simulateClick
} from "~ui-helpers"

export const config: PlasmoCSConfig = {
  matches: ["https://docs.google.com/*"]
}

// create and "register" the relay
relay({
  name: "get-zoom-value"
})

const getZoomValue = () => {
  return new Promise((resolve) => {
    sendViaRelay({ name: "get-zoom-value" }).then((response) => {
      resolve(response.zoomValue)
    })
  })
}

const changeZoom = (zoomValue) => {
  // don't do anything if zoom level is set to default value
  if (zoomValue === DEFAULT_ZOOM) {
    return
  }

  // get menu element responsible for changing zoom
  const zoomInput = getDOMElement(CLICKABLE_ZOOM_SELECT_ID)
  const { x: zoomInputX, y: zoomInputY } = getDOMElementCoordinates(zoomInput)
  simulateClick(zoomInput, zoomInputX, zoomInputY)

  // get zoom menu element dropdown
  const zoomInputAriaOwns = zoomInput.attributes["aria-owns"].value // this is the link
  const zoomInputSelect = getDOMElement(
    `.goog-menu.goog-menu-vertical[aria-activedescendant="${zoomInputAriaOwns}"]`
  )

  // figure out zoom value to select
  const zoomInputSelectOptions = zoomInputSelect.querySelectorAll(
    CLICKABLE_ZOOM_OPTION_CLASS
  )
  let newZoomLevelElement = null
  for (let i = 0; i < zoomInputSelectOptions.length; i++) {
    if (zoomInputSelectOptions[i].firstChild.textContent === zoomValue) {
      newZoomLevelElement = zoomInputSelectOptions[i].firstChild
    }
  }

  // somehow we may not have matched the right element
  if (!newZoomLevelElement) {
    return
  }

  // select new zoom level
  const { x: newZoomOptionX, y: newZoomOptionY } =
    getDOMElementCoordinates(newZoomLevelElement)
  simulateClick(newZoomLevelElement, newZoomOptionX, newZoomOptionY)

  // close dropdown with blur event (may need to check again to see if it's closed)
  setTimeout(() => {
    simulateClick(getDOMElement("canvas"), 0, 0)
  }, 500)
}

const getIsZoomSelectUIDisabled = () => {
  const zoomSelect = getDOMElement(CLICKABLE_ZOOM_SELECT_ID)
  return zoomSelect.classList.contains("goog-toolbar-combo-button-disabled")
}

const counter = counterFactory()
const observer = new MutationObserver((_mutationList, observer) => {
  const zoomIsDisabled = getIsZoomSelectUIDisabled()
  const isExecutionCountOverLimit = counter.getCount() > OBSERVE_EXECUTION_LIMIT

  if (isExecutionCountOverLimit) {
    observer.disconnect()
    return
  }

  if (!zoomIsDisabled) {
    getZoomValue().then((zoomValue) => {
      changeZoom(zoomValue)
    })

    observer.disconnect()
  }

  counter.increment()
})

// initial kick-off
const zoomIsDisabled = getIsZoomSelectUIDisabled()

if (zoomIsDisabled) {
  observer.observe(document.getElementById("docs-toolbar"), {
    attributes: true,
    childList: true
  })
} else {
  getZoomValue().then((zoomValue) => {
    changeZoom(zoomValue)
  })
}
