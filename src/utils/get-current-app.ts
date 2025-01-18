import type { WorkspaceAppName } from "../types";

const docsUrlRegex = /\/document\//;
const sheetsUrlRegex = /\/spreadsheets\//;
const excludeUrlRegex = /\/offline\/iframeapi/;

const getCurrentApp = (href: string): WorkspaceAppName | null => {
  if (excludeUrlRegex.test(href)) {
    return null;
  }

  if (docsUrlRegex.test(href)) {
    return "Docs";
  } else if (sheetsUrlRegex.test(href)) {
    return "Sheets";
  }
  return null;
};

export default getCurrentApp;
