import { sendToBackgroundViaRelay } from "@plasmohq/messaging";
import { describe, expect, test, vi } from "vitest";

import { RELAY_GET_APP_STORAGE_STATE } from "../constants";
import getAppStorageStateFromStorage from "./get-app-storage-state-from-storage";

vi.mock("@plasmohq/messaging", () => ({
  sendToBackgroundViaRelay: vi.fn()
}));

vi.mock("src/utils/localize", () => ({
  default: vi.fn((key) => key)
}));

describe("getAppStorageStateFromStorage", () => {
  test("should call sendToBackgroundViaRelay with correct arguments and resolve with state", async () => {
    const mockState = {
      zoomValue: "150%",
      viewOnly: true,
      classroomSupport: false
    };

    vi.mocked(sendToBackgroundViaRelay).mockResolvedValue(mockState);

    const storageKey = "docs";
    const result = await getAppStorageStateFromStorage(storageKey);

    expect(sendToBackgroundViaRelay).toHaveBeenCalledWith({
      name: RELAY_GET_APP_STORAGE_STATE,
      body: { storageKey }
    });

    expect(result).toEqual(mockState);
  });
});
