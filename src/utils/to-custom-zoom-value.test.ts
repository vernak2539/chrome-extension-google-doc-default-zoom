import { describe, expect, test } from "vitest";

import { toCustomZoomValue } from "./to-custom-zoom-value";

describe("toCustomZoomValue", () => {
  test.each([
    ["", ""],
    ["0", "50%"],
    ["30", "50%"],
    ["50", "50%"],
    ["100", "100%"],
    ["123", "123%"],
    ["123%", "123%"],
    ["075", "75%"],
    ["200", "200%"],
    ["250", "200%"]
  ])("%j becomes %j", (input, expected) => {
    expect(toCustomZoomValue(input)).toBe(expected);
  });
});
