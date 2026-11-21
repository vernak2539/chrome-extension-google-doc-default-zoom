import { describe, expect, test, vi } from "vitest";

import getAppStorageStateFromStorage from "./get-app-storage-state-from-storage";
import { sendMessage } from "./messaging";

vi.mock("src/utils/messaging", () => ({
  sendMessage: vi.fn()
}));

vi.mock("src/utils/localize", () => ({
  default: vi.fn((key) => key)
}));

describe("getAppStorageStateFromStorage", () => {
  test("should send getAppStorageState with the storage key and resolve with state", async () => {
    const mockState = {
      zoomValue: "150%",
      viewOnly: true,
      classroomSupport: false
    };

    vi.mocked(sendMessage).mockResolvedValue(mockState);

    const storageKey = "docs";
    const result = await getAppStorageStateFromStorage(storageKey);

    expect(sendMessage).toHaveBeenCalledWith("getAppStorageState", { storageKey });

    expect(result).toEqual(mockState);
  });
});
