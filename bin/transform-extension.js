/**
 * This script aims to transform this extension from "Google Workspace Zoom Default - Extended" to "Google Workspace Zoom Default"
 *
 * In order to do this, this script needs to do thw following:
 * 1. Remove "debugger" permissions from the package.json -> mainfest -> permissiosn array
 * 2. Update the package.json -> name from "google-workspace-zoom-default-extended" to "google-workspace-zoom-default"
 * 4. Update the package.json -> displayName from "__MSG_extensionNameExtended__" to "__MSG_extensionName__"
 * 5. Update the package.json -> mainfest -> name from "__MSG_extensionNameExtended__" to "__MSG_extensionName__"
 * 6. Disable "features.customZoomInput" for both "workspaceApps" in constants.ts
 * */

// add translations for all languages with key "__MSG_extensionNameExtended__"
