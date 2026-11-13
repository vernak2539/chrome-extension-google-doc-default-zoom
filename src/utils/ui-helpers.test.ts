// @vitest-environment jsdom
import { describe, expect, test } from "vitest";

import { simulateClick } from "./ui-helpers";

const EVENT_NAMES = [
  "pointerover",
  "pointerenter",
  "mouseover",
  "mouseenter",
  "pointermove",
  "mousemove",
  "pointerdown",
  "mousedown",
  "pointerup",
  "mouseup",
  "click"
];

const recordEvents = (target: EventTarget) => {
  const events: MouseEvent[] = [];
  EVENT_NAMES.forEach((name) =>
    target.addEventListener(name, (event) => events.push(event as MouseEvent))
  );
  return events;
};

describe("simulateClick", () => {
  test("hovers over the element before pressing and releasing the mouse on it", () => {
    const element = document.createElement("div");
    document.body.appendChild(element);
    const events = recordEvents(element);

    simulateClick(element, 10, 20);

    expect(events.map((event) => event.type)).toEqual(EVENT_NAMES);
  });

  test("dispatches every event at the given coordinates with the left button", () => {
    const element = document.createElement("div");
    document.body.appendChild(element);
    const events = recordEvents(element);

    simulateClick(element, 10, 20);

    events.forEach((event) => {
      expect(event.clientX).toBe(10);
      expect(event.clientY).toBe(20);
      expect(event.button).toBe(0);
    });
  });

  test("holds the button down only between press and release", () => {
    const element = document.createElement("div");
    document.body.appendChild(element);
    const events = recordEvents(element);

    simulateClick(element, 0, 0);

    const pressed = events.filter((event) => event.buttons === 1).map((event) => event.type);
    expect(pressed).toEqual(["pointerdown", "mousedown"]);
  });

  test("does not bubble enter events, like a real browser", () => {
    const parent = document.createElement("div");
    const element = document.createElement("div");
    parent.appendChild(element);
    document.body.appendChild(parent);
    const parentEvents = recordEvents(parent);

    simulateClick(element, 0, 0);

    expect(parentEvents.map((event) => event.type)).toEqual(
      EVENT_NAMES.filter((name) => name !== "pointerenter" && name !== "mouseenter")
    );
  });
});
