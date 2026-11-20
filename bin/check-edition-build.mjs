/**
 * Checks the output of `pnpm build:base` and `pnpm build:extended` (`build/<target>-<edition>`).
 *
 * The editions differ only by the build mode (the `EDITIONS` map in wxt.config.ts), and a wrong mode silently
 * changes the manifest instead of failing the build. This fails when a built edition has the wrong permissions,
 * name, Firefox add-on id or code.
 *
 * Run it after building: `pnpm check:editions`
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const buildDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../build");

const EDITIONS = {
  base: {
    name: "__MSG_extensionName__",
    geckoId: "google-workspace-zoom-default@vernacchia.dev",
    hasDebugger: false
  },
  extended: {
    name: "__MSG_extensionNameExtended__",
    geckoId: "google-workspace-zoom-extended@vernacchia.dev",
    hasDebugger: true
  }
};

// Typed only by the debugger handler, which the minifier drops from Base
const DEBUGGER_CODE = "Input.insertText";

const checkBuild = (directory, target, edition) => {
  const expected = EDITIONS[edition];
  const manifest = JSON.parse(readFileSync(path.join(directory, "manifest.json"), "utf8"));
  const problems = [];

  if ((manifest.permissions ?? []).includes("debugger") !== expected.hasDebugger) {
    problems.push(
      `manifest ${expected.hasDebugger ? "is missing" : "leaks"} the "debugger" permission`
    );
  }
  // The content script needs no host permission: its `matches` already inject it. A host permission adds an
  // install warning, and adding one back later would ask every user to accept it. Firefox MV2 lists host
  // patterns in `permissions`, so look there too.
  const hostPermissions = [
    ...(manifest.host_permissions ?? []),
    ...(manifest.permissions ?? []).filter(
      (permission) => permission.includes("://") || permission === "<all_urls>"
    )
  ];
  if (hostPermissions.length > 0) {
    problems.push(`manifest requests host permissions: ${hostPermissions.join(", ")}`);
  }
  if (manifest.name !== expected.name) {
    problems.push(`manifest name is "${manifest.name}", expected "${expected.name}"`);
  }
  const geckoId = manifest.browser_specific_settings?.gecko?.id;
  if (target.startsWith("firefox") && geckoId !== expected.geckoId) {
    problems.push(`Firefox add-on id is "${geckoId}", expected "${expected.geckoId}"`);
  }

  const hasDebuggerCode = readdirSync(directory, { recursive: true })
    .filter((file) => file.endsWith(".js"))
    .some((file) => readFileSync(path.join(directory, file), "utf8").includes(DEBUGGER_CODE));
  if (hasDebuggerCode !== expected.hasDebugger) {
    problems.push(`bundle ${expected.hasDebugger ? "is missing" : "contains"} "${DEBUGGER_CODE}"`);
  }

  return problems;
};

const builds = existsSync(buildDirectory)
  ? readdirSync(buildDirectory)
      .map((name) => /^((?:chrome|edge|firefox)-mv\d+)-(base|extended)$/.exec(name))
      .filter(Boolean)
  : [];

if (builds.length === 0) {
  console.error(
    `no build found in ${buildDirectory}: run pnpm build:base and pnpm build:extended first`
  );
  process.exit(1);
}

let failed = false;
for (const [name, target, edition] of builds) {
  const problems = checkBuild(path.join(buildDirectory, name), target, edition);
  for (const problem of problems) {
    console.error(`${name}: ${problem}`);
  }
  if (problems.length === 0) {
    console.log(`ok ${name}`);
  }
  failed ||= problems.length > 0;
}
process.exit(failed ? 1 : 0);
