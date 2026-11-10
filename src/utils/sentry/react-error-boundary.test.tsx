// @vitest-environment jsdom
import { createRoot, type Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LoggerContext } from "../logger/context";
import { setupSentryReactErrorBoundary } from "./react-error-boundary";

const { fakeScope } = vi.hoisted(() => ({
  fakeScope: { captureException: vi.fn() }
}));

vi.mock("./base", () => ({
  createSentryClient: vi.fn(() => fakeScope)
}));

// The real logger deep-imports tslog, which the jsdom (browser-condition) resolver can't resolve.
// The default LoggerContext value only needs an object with an `error` method here.
vi.mock("../logger/index", () => ({
  default: class {
    error = vi.fn();
  }
}));

const boom = new Error("boom");

const Thrower = () => {
  throw boom;
};

const Wrapped = setupSentryReactErrorBoundary("popup")(Thrower, "Fallback Heading");

describe("ErrorBoundaryWithSentry", () => {
  let container: HTMLDivElement;
  let root: Root;

  const render = (element: JSX.Element) => {
    act(() => {
      root.render(element);
    });
  };

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    // React logs caught render errors; keep the test output readable
    vi.spyOn(console, "error").mockImplementation(() => {});
    fakeScope.captureException.mockClear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  it("renders the fallback and reports the error to Sentry once", () => {
    render(<Wrapped />);

    expect(container.textContent).toContain("Fallback Heading");
    expect(container.textContent).toContain("Sorry! Something has gone wrong");
    expect(fakeScope.captureException).toHaveBeenCalledTimes(1);
    expect(fakeScope.captureException.mock.calls[0][0]).toBe(boom);
  });

  it("logs the message and the error, after reporting to Sentry", () => {
    const fakeLogger = { error: vi.fn() };

    render(
      <LoggerContext.Provider value={fakeLogger as never}>
        <Wrapped />
      </LoggerContext.Provider>
    );

    expect(fakeLogger.error).toHaveBeenCalledTimes(1);
    expect(fakeLogger.error).toHaveBeenCalledWith(expect.any(String), boom);
    expect(fakeScope.captureException.mock.invocationCallOrder[0]).toBeLessThan(
      fakeLogger.error.mock.invocationCallOrder[0]
    );
  });

  it("still reports and renders the fallback when the logger throws", () => {
    const fakeLogger = {
      error: vi.fn(() => {
        throw new Error("logger failure");
      })
    };

    render(
      <LoggerContext.Provider value={fakeLogger as never}>
        <Wrapped />
      </LoggerContext.Provider>
    );

    expect(fakeScope.captureException).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain("Fallback Heading");
  });
});
