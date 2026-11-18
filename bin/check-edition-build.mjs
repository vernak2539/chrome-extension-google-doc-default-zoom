/**
 * Checks the output of `pnpm build:base` and `pnpm build:extended` (`build/<target>-<edition>`).
 *
 * The editions differ only by Plasmo env files, which a missing or misspelled variable turns into a silently
 * different manifest, so this fails the build when a built edition has the wrong permissions, name, add-on id or code.
 *
 * Run it after building: `pnpm check:editions`
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const buildDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../build");

const EDITIONS = {
  base: {
    manifestName: "__MSG_extensionName__",
    geckoId: "google-workspace-zoom-default@vernacchia.dev",
    hasDebugger: false
  },
  extended: {
    manifestName: "__MSG_extensionNameExtended__",
    geckoId: "google-workspace-zoom-extended@vernacchia.dev",
    hasDebugger: true
  }
};

const DEBUGGER_CODE = "Input.insertText";
const DEBUGGER_KEY_EVENT_CODE = "Input.dispatchKeyEvent";
// The popup heading is `localize("extensionNameExtended")` once minified. The bare key also appears in the
// bundled package.json, so only the call counts.
const EXTENDED_POPUP_NAME_CALL = /\(\s*["']extensionNameExtended["']\s*\)/;

const findJsFiles = (directory) =>
  readdirSync(directory).flatMap((entry) => {
    const entryPath = path.join(directory, entry);
    if (statSync(entryPath).isDirectory()) {
      return findJsFiles(entryPath);
    }
    return entry.endsWith(".js") ? [entryPath] : [];
  });

const collectStrings = (value) => {
  if (typeof value === "string") {
    return [value];
  }
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
};

const checkManifest = (manifest, { target, edition }) => {
  const expected = EDITIONS[edition];
  const problems = [];
  const permissions = manifest.permissions ?? [];

  for (const text of collectStrings(manifest)) {
    if (text.startsWith("$")) {
      problems.push(`manifest has the unexpanded variable "${text}"`);
    }
  }
  if (permissions.some((permission) => permission === "")) {
    problems.push("manifest has an empty permission");
  }

  const hasDebugger = permissions.includes("debugger");
  if (expected.hasDebugger && !hasDebugger) {
    problems.push('manifest is missing the "debugger" permission');
  }
  if (!expected.hasDebugger && hasDebugger) {
    problems.push('manifest leaks the "debugger" permission');
  }

  if (manifest.name !== expected.manifestName) {
    problems.push(`manifest name is "${manifest.name}", expected "${expected.manifestName}"`);
  }

  if (target.startsWith("firefox")) {
    const geckoId = manifest.browser_specific_settings?.gecko?.id;
    if (geckoId !== expected.geckoId) {
      problems.push(`Firefox add-on id is "${geckoId}", expected "${expected.geckoId}"`);
    }
  }

  return problems;
};

const checkCode = (directory, { edition }) => {
  const problems = [];
  const files = findJsFiles(directory);
  const contentOf = (file) => readFileSync(file, "utf8");

  if (edition === "base") {
    for (const file of files) {
      const content = contentOf(file);
      for (const code of [DEBUGGER_CODE, DEBUGGER_KEY_EVENT_CODE]) {
        if (content.includes(code)) {
          problems.push(`${path.relative(directory, file)} contains "${code}"`);
        }
      }
      if (path.basename(file).startsWith("popup.") && EXTENDED_POPUP_NAME_CALL.test(content)) {
        problems.push(
          `${path.relative(directory, file)} sets the popup heading to the Extended name`
        );
      }
    }
  } else if (!files.some((file) => contentOf(file).includes(DEBUGGER_CODE))) {
    problems.push(`no .js file contains "${DEBUGGER_CODE}"`);
  }

  return problems;
};

const findBuilds = () => {
  if (!existsSync(buildDirectory)) {
    return [];
  }
  return readdirSync(buildDirectory).flatMap((name) => {
    const match = /^(chrome|edge|firefox)-mv\d+-(base|extended)$/.exec(name);
    return match ? [{ name, target: name.slice(0, -match[2].length - 1), edition: match[2] }] : [];
  });
};

const builds = findBuilds();
const problems = [];

if (builds.length === 0) {
  problems.push(
    `no build found in ${buildDirectory}: run pnpm build:base and pnpm build:extended first`
  );
}

for (const build of builds) {
  const directory = path.join(buildDirectory, build.name);
  const manifestPath = path.join(directory, "manifest.json");
  if (!existsSync(manifestPath)) {
    problems.push(`${build.name}: manifest.json not found`);
    continue;
  }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const buildProblems = [...checkManifest(manifest, build), ...checkCode(directory, build)];
  problems.push(...buildProblems.map((problem) => `${build.name}: ${problem}`));
  if (buildProblems.length === 0) {
    console.log(`ok ${build.name}`);
  }
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}
