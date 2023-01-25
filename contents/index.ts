import { relay, sendViaRelay } from "@plasmohq/messaging"

import type { PlasmoContentScript } from "~node_modules/plasmo"

export const config: PlasmoContentScript = {
  matches: ["https://docs.google.com/*"]
}

const CLICKABLE_ZOOM_SELECT_ID = "zoomSelect"
const simulateMouseEvent = (element, eventName, coordX, coordY) => {
  element.dispatchEvent(
    new MouseEvent(eventName, {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: coordX,
      clientY: coordY,
      button: 0
    })
  )
}

const getZoomSelectElement = () =>
  document.querySelector(`#${CLICKABLE_ZOOM_SELECT_ID}`)

const getClickableElementBoundingBox = (element) => {
  const box = element.getBoundingClientRect()

  const coordX = box.left + (box.right - box.left) / 2
  const coordY = box.top + (box.bottom - box.top) / 2

  return { coordX, coordY }
}

const getZoomSelectDropdownElement = (zoomElement) => {
  const dropdownAriaOwnsValue = zoomElement.attributes["aria-owns"].value

  return document.querySelector(
    `.goog-menu.goog-menu-vertical[aria-activedescendant="${dropdownAriaOwnsValue}"]`
  )
}

// create and "register" the relay
relay({
  name: "get-zoom-value"
})

// use the relay
sendViaRelay({ name: "get-zoom-value" }).then((response) => {
  const zoomElement = getZoomSelectElement()
  const { coordX, coordY } = getClickableElementBoundingBox(zoomElement)
  simulateMouseEvent(zoomElement, "mousedown", coordX, coordY)
  simulateMouseEvent(zoomElement, "mouseup", coordX, coordY)

  const zoomSelectDropdownElement =
    getZoomSelectDropdownElement(zoomElement).firstChild
  const { coordX: x, coordY: y } = getClickableElementBoundingBox(
    zoomSelectDropdownElement
  )

  simulateMouseEvent(zoomSelectDropdownElement, "mousedown", x, y)
  simulateMouseEvent(zoomSelectDropdownElement, "mouseup", x, y)
  simulateMouseEvent(zoomSelectDropdownElement, "blur", x, y)

  console.log(response)
})
