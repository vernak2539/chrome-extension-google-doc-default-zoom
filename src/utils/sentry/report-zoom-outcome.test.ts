import type { Scope } from "@sentry/browser";
import { describe, expect, test, vi } from "vitest";

import { reportZoomOutcome } from "./report-zoom-outcome";

const createScope = () => {
  const scope = { setTag: vi.fn(), captureException: vi.fn(), captureMessage: vi.fn() };
  return { scope, asScope: scope as unknown as Scope };
};

describe("reportZoomOutcome", () => {
  test.each([{ status: "applied" }, { status: "skipped", reason: "default_zoom" }] as const)(
    "should not report a $status outcome",
    (outcome) => {
      const { scope, asScope } = createScope();

      reportZoomOutcome(asScope, outcome);

      expect(scope.captureException).not.toHaveBeenCalled();
      expect(scope.captureMessage).not.toHaveBeenCalled();
    }
  );

  test("should report a failed outcome once, as a message tagged with its reason", () => {
    const { scope, asScope } = createScope();

    reportZoomOutcome(asScope, { status: "failed", reason: "zoom_menu_missing" });

    expect(scope.setTag).toHaveBeenCalledWith("zoomFailReason", "zoom_menu_missing");
    expect(scope.captureMessage).toHaveBeenCalledExactlyOnceWith(
      "Zoom failed: zoom_menu_missing",
      "warning"
    );
    expect(scope.captureException).not.toHaveBeenCalled();
  });

  test("should report a failed outcome with an error once, as an exception", () => {
    const { scope, asScope } = createScope();
    const error = new Error("boom");

    reportZoomOutcome(asScope, { status: "failed", reason: "exception", error });

    expect(scope.captureException).toHaveBeenCalledExactlyOnceWith(error);
    expect(scope.captureMessage).not.toHaveBeenCalled();
  });
});
