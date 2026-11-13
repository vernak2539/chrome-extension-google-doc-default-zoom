interface Coordinates {
  x: number;
  y: number;
}

type SimulatedEventName =
  | "pointerover"
  | "pointerenter"
  | "pointermove"
  | "pointerdown"
  | "pointerup"
  | "mouseover"
  | "mouseenter"
  | "mousemove"
  | "mousedown"
  | "mouseup"
  | "click";

// `mouseenter` and `pointerenter` don't bubble in a real browser, so don't make them bubble here either
const NON_BUBBLING_EVENTS = new Set<SimulatedEventName>(["pointerenter", "mouseenter"]);

// Order matches what a browser fires when a real mouse moves onto an element and then clicks it
const HOVER_EVENTS: SimulatedEventName[] = [
  "pointerover",
  "pointerenter",
  "mouseover",
  "mouseenter",
  "pointermove",
  "mousemove"
];
const PRESS_EVENTS: SimulatedEventName[] = [
  "pointerdown",
  "mousedown",
  "pointerup",
  "mouseup",
  "click"
];

const simulateMouseEvent = (
  element: Element,
  eventName: SimulatedEventName,
  coordX: number,
  coordY: number,
  buttons: number
) => {
  const init: MouseEventInit = {
    bubbles: !NON_BUBBLING_EVENTS.has(eventName),
    cancelable: true,
    composed: true,
    clientX: coordX,
    clientY: coordY,
    screenX: coordX,
    screenY: coordY,
    button: 0,
    buttons
  };

  const isPointerEvent = eventName.startsWith("pointer");
  const event =
    isPointerEvent && typeof PointerEvent !== "undefined"
      ? new PointerEvent(eventName, {
          ...init,
          pointerId: 1,
          pointerType: "mouse",
          isPrimary: true
        })
      : new MouseEvent(eventName, init);

  element.dispatchEvent(event);
};

// Google Docs is weird about this. A `.click()` execution or dispatching a single `MouseEvent` doesn't "count" as a
// click in the menu. Its menus (Google Closure UI) also only act on a click once the item has been highlighted by the
// mouse hovering over it, so the hover events have to come before the press events.
export const simulateClick = (element: Element, coordX: number, coordY: number) => {
  HOVER_EVENTS.forEach((eventName) => simulateMouseEvent(element, eventName, coordX, coordY, 0));
  PRESS_EVENTS.forEach((eventName) => {
    const buttons = eventName === "pointerdown" || eventName === "mousedown" ? 1 : 0;
    simulateMouseEvent(element, eventName, coordX, coordY, buttons);
  });
};

export const getDOMElement = (selector: string) => {
  return document.querySelector(selector);
};

export const getDOMElementCoordinates = (element: Element): Coordinates => {
  const box = element.getBoundingClientRect();

  const coordX = box.left + (box.right - box.left) / 2;
  const coordY = box.top + (box.bottom - box.top) / 2;

  return { x: coordX, y: coordY };
};

// TODO: Use this everywhere!
export const getDOMElementAndClick = (selector: string) => {
  const element = getDOMElement(selector);

  if (!element) {
    return null;
  }

  const { x, y } = getDOMElementCoordinates(element);

  simulateClick(element, x, y);
  return element;
};

export const clickDOMElement = (element: Element) => {
  const { x, y } = getDOMElementCoordinates(element);

  simulateClick(element, x, y);
};
