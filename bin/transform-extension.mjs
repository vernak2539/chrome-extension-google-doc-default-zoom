/**
 * This script aims to transform this extension from "Google Workspace Zoom Default - Extended" to "Google Workspace Zoom Default"
 *
 * In order to do this, this script needs to do thw following:
 * 1. Remove "debugger" permissions from the package.json -> mainfest -> permissiosn array
 * 2. Update the package.json -> name from "google-workspace-zoom-default-extended" to "google-workspace-zoom-default"
 * 4. Update the package.json -> displayName from "__MSG_extensionNameExtended__" to "__MSG_extensionName__"
 * 5. Update the package.json -> manifest -> name from "__MSG_extensionNameExtended__" to "__MSG_extensionName__"
 * 6. Disable "features.customZoomInput" for both "workspaceApps" in constants.ts
 * */

import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import assert from "node:assert";
import editPackageJson from '@rogerpence/edit-package-json'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// change things
const updateManifestPermissionsArgs = {
  key: 'mainfest:permissions',
  value: [],
  force: true
}

editPackageJson(updateManifestPermissionsArgs)
// editPackageJson(updateManifestPermissionsArgs)
// editPackageJson(updateManifestPermissionsArgs)
// editPackageJson(updateManifestPermissionsArgs)


// verify package.json is how it should look
;(async () => {
  const pkgPath = path.resolve(__dirname, "../package.json")
  const pkgImport = await import(pkgPath, { assert: { type: "json" }})
  const pkg = pkgImport.default

  console.log(pkg.default)


  assert.equal(pkg.name, "google-workspace-zoom-default")
  assert.equal(pkg.displayName, "__MSG_extensionName__")
  assert.equal(pkg.manifest.name, "__MSG_extensionName__")
  assert.equal(pkg.manifest.permissions, [])
})()

// TODO
// add translations for all languages with key "__MSG_extensionNameExtended__"
