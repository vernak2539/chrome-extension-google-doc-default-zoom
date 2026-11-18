/// <reference types="node" />
import path from "node:path";

import type { FixtureMode } from "./fixture-sanitize";

// relative to the repository root, where every e2e command runs
export const FIXTURES_DIR = path.resolve("e2e/fixtures");
export const RESULTS_DIR = path.resolve("e2e/results");
// unsanitized captures: gitignored, never committed or uploaded
export const RAW_DIR = path.join(RESULTS_DIR, "raw");

// Public documents owned by the maintainer. They are only ever opened signed out.
export const LIVE_DOC_URL =
  process.env.E2E_LIVE_DOC_URL ??
  "https://docs.google.com/document/d/1o-TwC6JR3zQDcXTllDVssMJpX0UxVlxIcEFvwxBYI1M/edit?tab=t.0";
export const LIVE_SHEET_URL =
  process.env.E2E_LIVE_SHEET_URL ??
  "https://docs.google.com/spreadsheets/d/1H_MOO3Xdq4s8lkI4ZAQTlWv7wxXTn4VoWlvq-2zv4N8/edit?gid=0#gid=0";

export interface CaptureTarget {
  // file name (without extension) in e2e/fixtures
  name: string;
  mode: FixtureMode;
  url: string;
  // the zoom control that must be enabled before capturing (editor mode)
  zoomControlSelector?: "#zoomSelect" | "#t-zoom";
}

export const CAPTURE_TARGETS: CaptureTarget[] = [
  { name: "docs-editor", mode: "editor", url: LIVE_DOC_URL, zoomControlSelector: "#zoomSelect" },
  { name: "docs-view-only", mode: "view", url: LIVE_DOC_URL },
  { name: "sheets-editor", mode: "editor", url: LIVE_SHEET_URL, zoomControlSelector: "#t-zoom" }
];
