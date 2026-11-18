// @vitest-environment jsdom
/// <reference types="node" />
import { existsSync, readFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, test } from "vitest";

import {
  findFixtureLeaks,
  missingSelectors,
  parseFixture,
  sanitizeFixture
} from "./fixture-sanitize";
import { CAPTURE_TARGETS, FIXTURES_DIR, RAW_DIR } from "./targets";

const playwrightVersion = JSON.parse(
  readFileSync("node_modules/playwright/package.json", "utf8")
).version;

// Writes e2e/fixtures/<name>.html from the raw capture, and refuses to when anything looks wrong.
// A target whose capture failed has no raw file and is skipped, so one failing page doesn't stop the
// others from being refreshed (its fixture keeps the previous content).
describe("sanitize the raw captures", () => {
  for (const { name, mode } of CAPTURE_TARGETS) {
    const rawPath = path.join(RAW_DIR, `${name}.html`);

    test.skipIf(!existsSync(rawPath))(name, async () => {
      const sanitized = sanitizeFixture(parseFixture(await readFile(rawPath, "utf8")), mode);

      expect(missingSelectors(parseFixture(sanitized), mode)).toEqual([]);
      expect(findFixtureLeaks(sanitized)).toEqual([]);

      const header = `<!-- captured ${new Date().toISOString().slice(0, 10)}, signed out, playwright ${playwrightVersion}, mode ${mode} -->`;
      await writeFile(path.join(FIXTURES_DIR, `${name}.html`), `${header}\n${sanitized}\n`);
    });
  }
});
