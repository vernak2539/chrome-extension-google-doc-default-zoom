/**
 * This script aims to transform this extension from "Google Workspace Zoom Default - Extended" to "Google Workspace Zoom Default"
 *
 * In order to do this, this script needs to do thw following:
 * 1. Remove "debugger" permissions from the package.json -> mainfest -> permissiosn array
 * 2. Update the package.json -> name from "google-workspace-zoom-default-extended" to "google-workspace-zoom-default"
 * 4. Update the package.json -> displayName from "__MSG_extensionNameExtended__" to "__MSG_extensionName__"
 * 5. Update the package.json -> manifest -> name from "__MSG_extensionNameExtended__" to "__MSG_extensionName__"
 * 6. Disable "features.customZoomInput" for both "workspaceApps" in constants.ts
 *
 * ***** NOTE FIREFOX INFORMATION *****
 *
 * Firefox will not support an "Extended" version of this extension
 * This is because Firefox does not support the "debugger" permission, meaning custom values are not supported
 * See: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/permissions#api_permissions
 *
 * This will still be set up as if the "Extended" version is being transformed to the non-extended version
 * */

import { execaSync } from "execa";
import jsonfile from "jsonfile";
import assert from "node:assert";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkgPath = path.resolve(__dirname, "../package.json");

// Update package.json fields
const originalPkg = jsonfile.readFileSync(pkgPath);

originalPkg.name = "google-workspace-zoom-default";
originalPkg.displayName = "__MSG_extensionName__";
originalPkg.manifest.name = "__MSG_extensionName__";
originalPkg.manifest.permissions = [];
originalPkg.manifest.browser_specific_settings.gecko.id = `${originalPkg.name}@vernacchia.dev`;

execaSync(path.resolve(__dirname, "./update-code-files.sh"));
execaSync(path.resolve(__dirname, "./update-icons.sh"));
execaSync(path.resolve(__dirname, "./remove-files.sh"));

jsonfile.writeFileSync(pkgPath, originalPkg, { spaces: 2 });

// verify package.json is how it should look
const newPkg = jsonfile.readFileSync(pkgPath);

assert.equal(newPkg.name, "google-workspace-zoom-default");
assert.equal(newPkg.displayName, "__MSG_extensionName__");
assert.equal(newPkg.manifest.name, "__MSG_extensionName__");
assert.equal(newPkg.manifest.permissions.length, 0);
assert.equal(
  newPkg.manifest.browser_specific_settings.gecko.id,
  `google-workspace-zoom-default@vernacchia.dev`
);
