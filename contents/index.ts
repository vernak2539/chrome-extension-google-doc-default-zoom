import type { PlasmoCSConfig } from "plasmo"

import { relay, sendViaRelay } from "@plasmohq/messaging"

import {
  CLICKABLE_ZOOM_OPTION_CLASS,
  CLICKABLE_ZOOM_SELECT_ID
} from "~constants"
import {
  getDOMElement,
  getDOMElementCoordinates,
  simulateClick,
  simulateMouseEvent
} from "~ui-helpers"

export const config: PlasmoCSConfig = {
  matches: ["https://docs.google.com/*"]
}

// create and "register" the relay
relay({
  name: "get-zoom-value"
})

// use the relay
sendViaRelay({ name: "get-zoom-value" }).then((response) => {
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
    if (
      zoomInputSelectOptions[i].firstChild.textContent === response.zoomValue
    ) {
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
    simulateClick(getDOMElement("body"), 1, 1)
  }, 100)
})
