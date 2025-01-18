import { sendToBackgroundViaRelay } from "@plasmohq/messaging";

export const updateFeatureClassroomSupportInStorage = async (
  storageKey: string,
  value: boolean
): Promise<void> => {
  await sendToBackgroundViaRelay({
    name: "update-feature-classroom-support",
    body: {
      storageKey,
      value
    }
  });
};
