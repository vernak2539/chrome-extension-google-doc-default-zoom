import { runContentScript } from "src/content-script";
import { defineContentScript } from "wxt/utils/define-content-script";

export default defineContentScript({
  matches: [
    "https://docs.google.com/document/*",
    "https://docs.google.com/spreadsheets/*",
    "https://classroom.google.com/*"
  ],
  excludeMatches: ["https://docs.google.com/offline/*"],
  allFrames: true,
  main() {
    runContentScript();
  }
});
