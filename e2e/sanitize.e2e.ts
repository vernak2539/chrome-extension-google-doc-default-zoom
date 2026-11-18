// @vitest-environment jsdom
/// <reference types="node" />
import { readFileSync } from "node:fs";
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

// Writes e2e/fixtures/<name>.html from the raw capture, and refuses to when anything looks wrong
describe("sanitize the raw captures", () => {
  test.each(CAPTURE_TARGETS)("$name", async ({ name, mode }) => {
    const raw = await readFile(path.join(RAW_DIR, `${name}.html`), "utf8");
    const sanitized = sanitizeFixture(parseFixture(raw), mode);

    expect(missingSelectors(parseFixture(sanitized), mode)).toEqual([]);
    expect(findFixtureLeaks(sanitized)).toEqual([]);

    const header = `<!-- captured ${new Date().toISOString().slice(0, 10)}, signed out, playwright ${playwrightVersion}, mode ${mode} -->`;
    await writeFile(path.join(FIXTURES_DIR, `${name}.html`), `${header}\n${sanitized}\n`);
  });
});
