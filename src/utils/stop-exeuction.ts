import type { WorkspaceAppName } from "src/types";

// we don't want the content script to execut in certain cases
export const stopExecution = (currentApp: WorkspaceAppName | null): boolean => {
  if (!currentApp) {
    return true;
  }

  // '/document/d/XXXX/preview'
  // "/spreadsheets/u/0/d/XXXX-XX/preview/sheet";
  const { pathname } = new URL(window.location.href);

  if (currentApp === "Docs") {
    const docsPreviewRegex = /\/preview$/;

    if (docsPreviewRegex.test(pathname)) {
      return true;
    }
  } else if (currentApp === "Sheets") {
    const sheetsPreviewRegex = /\/preview\/sheet$/;

    if (sheetsPreviewRegex.test(pathname)) {
      return true;
    }
  }

  return false;
};
