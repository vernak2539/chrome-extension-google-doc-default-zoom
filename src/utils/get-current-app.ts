import type { WorkspaceAppName } from "../types";

const docsUrlRegex = new RegExp(
  /https:\/\/docs\.google\.com\/document\/d\/(.*?)\/.*?/g
);
const sheetsUrlRegex = new RegExp(
  /https:\/\/docs\.google\.com\/spreadsheets\/d\/(.*?)\/.*?/g
);

const getCurrentApp = (href: string): WorkspaceAppName | null => {
  const url = new URL(href);

  if (docsUrlRegex.test(url.href)) {
    return "Docs";
  } else if (sheetsUrlRegex.test(url.href)) {
    return "Sheets";
  }

  return null;
};

export default getCurrentApp;
