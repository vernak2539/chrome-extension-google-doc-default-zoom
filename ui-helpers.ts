interface Coordinates {
  x: number
  y: number
}

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

// Google Docs is weird about this. A `.click()` execution or dispatching a `MouseEvent` doesn't "count" as a click
// in the menu
export const simulateClick = (element, coordX, coordY) => {
  simulateMouseEvent(element, "mousedown", coordX, coordY)
  simulateMouseEvent(element, "mouseup", coordX, coordY)
  simulateMouseEvent(element, "click", coordX, coordY)
}

export const getDOMElement = (selector: string) => {
  return document.querySelector(selector)
}

export const getDOMElementCoordinates = (element: Element): Coordinates => {
  const box = element.getBoundingClientRect()

  const coordX = box.left + (box.right - box.left) / 2
  const coordY = box.top + (box.bottom - box.top) / 2

  return { x: coordX, y: coordY }
}
