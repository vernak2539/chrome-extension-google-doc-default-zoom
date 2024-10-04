import { describe, expect, test } from "vitest";
import counterFactory from "./counter-factory";

describe("counterFactory", () => {
  test("should increment", () => {
    const counter = counterFactory();

    counter.increment();
    counter.increment();

    expect(counter.getCount()).toEqual(2);
  });
});
