import type { WorkspaceAppName } from "src/types";

// we don't want the content script to execut in certain cases
export const stopExecution = (currentApp: WorkspaceAppName | null): boolean => {
  if (!currentApp) {
    return true;
  }

  return false;
};
