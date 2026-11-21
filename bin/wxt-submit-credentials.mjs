/**
 * Converts the `SUBMIT_KEYS` JSON secret into the environment variables that `wxt submit` reads.
 *
 * `wxt submit` is WXT's alias for `publish-browser-extension`, which takes `CHROME_*`, `EDGE_*` and
 * `FIREFOX_*` variables. The repository keeps one JSON secret per edition, so this writes the matching
 * variables to `$GITHUB_ENV` before the submit step.
 *
 * Chrome API v1.1 is at end of life (Google's shutdown date is 2026-10-15). A `chrome` object with
 * `serviceAccountClientEmail`, a `serviceAccountAccessToken`, or `apiVersion: "v2"` selects the v2
 * service-account credentials; the old `clientId` / `clientSecret` / `refreshToken` fields are still
 * accepted for older secrets.
 */

import { appendFileSync } from "node:fs";

const EOF = "__WXT_SUBMIT_EOF__";

const includeFirefox = process.env.INCLUDE_FIREFOX === "true";
const keys = JSON.parse(process.env.SUBMIT_KEYS ?? "{}");

const requireFields = (object, fields, label) => {
  const missing = fields.filter((field) => object[field] == null || object[field] === "");
  if (missing.length > 0) {
    throw new Error(`${label} is missing: ${missing.join(", ")}`);
  }
};

const chrome = keys.chrome ?? {};
const chromeExtensionId = chrome.extensionId ?? chrome.extId;
const chromeUsesV2 =
  chrome.apiVersion === "v2" ||
  (chrome.apiVersion !== "v1.1" &&
    (chrome.serviceAccountClientEmail != null || chrome.serviceAccountAccessToken != null));
const chromeEnv = {
  CHROME_API_VERSION: chromeUsesV2 ? "v2" : "v1.1",
  CHROME_EXTENSION_ID: chromeExtensionId,
  CHROME_SKIP_SUBMIT_REVIEW: String(chrome.skipSubmitReview ?? false)
};

if (chromeUsesV2) {
  requireFields(
    { ...chrome, extensionId: chromeExtensionId },
    ["extensionId", "publisherId"],
    "chrome (v2)"
  );
  chromeEnv.CHROME_PUBLISHER_ID = chrome.publisherId;
  if (chrome.serviceAccountAccessToken != null) {
    chromeEnv.CHROME_SERVICE_ACCOUNT_ACCESS_TOKEN = chrome.serviceAccountAccessToken;
  } else {
    requireFields(chrome, ["serviceAccountClientEmail", "serviceAccountPrivateKey"], "chrome (v2)");
    chromeEnv.CHROME_SERVICE_ACCOUNT_CLIENT_EMAIL = chrome.serviceAccountClientEmail;
    chromeEnv.CHROME_SERVICE_ACCOUNT_PRIVATE_KEY = chrome.serviceAccountPrivateKey;
  }
} else {
  requireFields(
    { ...chrome, extensionId: chromeExtensionId },
    ["extensionId", "clientId", "clientSecret", "refreshToken"],
    "chrome (v1.1)"
  );
  chromeEnv.CHROME_CLIENT_ID = chrome.clientId;
  chromeEnv.CHROME_CLIENT_SECRET = chrome.clientSecret;
  chromeEnv.CHROME_REFRESH_TOKEN = chrome.refreshToken;
  if (chrome.publishTarget != null) chromeEnv.CHROME_PUBLISH_TARGET = chrome.publishTarget;
}

const edge = keys.edge ?? {};
requireFields(edge, ["clientId", "apiKey", "productId"], "edge");
const edgeEnv = {
  EDGE_CLIENT_ID: edge.clientId,
  EDGE_API_KEY: edge.apiKey,
  EDGE_PRODUCT_ID: edge.productId,
  EDGE_SKIP_SUBMIT_REVIEW: String(edge.skipSubmitReview ?? false)
};

let firefoxEnv = {};
if (includeFirefox) {
  const firefox = keys.firefox ?? {};
  const firefoxExtensionId = firefox.extensionId ?? firefox.extId;
  const firefoxJwtIssuer = firefox.jwtIssuer ?? firefox.apiKey;
  const firefoxJwtSecret = firefox.jwtSecret ?? firefox.apiSecret;
  requireFields(
    {
      ...firefox,
      extensionId: firefoxExtensionId,
      jwtIssuer: firefoxJwtIssuer,
      jwtSecret: firefoxJwtSecret
    },
    ["extensionId", "jwtIssuer", "jwtSecret"],
    "firefox"
  );
  firefoxEnv = {
    FIREFOX_EXTENSION_ID: firefoxExtensionId,
    FIREFOX_JWT_ISSUER: firefoxJwtIssuer,
    FIREFOX_JWT_SECRET: firefoxJwtSecret,
    FIREFOX_CHANNEL: firefox.channel ?? "listed",
    FIREFOX_SKIP_SUBMIT_REVIEW: String(firefox.skipSubmitReview ?? false)
  };
}

const envFile = process.env.GITHUB_ENV;
if (envFile == null) throw new Error("GITHUB_ENV is not set");

// Mask credentials only: masking a value like "v2" or "false" would redact unrelated log lines.
// The service-account private key is multiline, so it can't use the workflow command; it is never printed.
const SECRET_KEYS = new Set([
  "CHROME_CLIENT_ID",
  "CHROME_CLIENT_SECRET",
  "CHROME_REFRESH_TOKEN",
  "CHROME_SERVICE_ACCOUNT_CLIENT_EMAIL",
  "CHROME_SERVICE_ACCOUNT_ACCESS_TOKEN",
  "EDGE_CLIENT_ID",
  "EDGE_API_KEY",
  "FIREFOX_JWT_ISSUER",
  "FIREFOX_JWT_SECRET"
]);

for (const [key, value] of Object.entries({ ...chromeEnv, ...edgeEnv, ...firefoxEnv })) {
  const text = String(value);
  if (text.includes(EOF)) throw new Error(`${key} contains the ${EOF} delimiter`);
  // Multiline values can't use the workflow command syntax
  if (SECRET_KEYS.has(key) && !text.includes("\n")) console.log(`::add-mask::${text}`);
  appendFileSync(envFile, `${key}<<${EOF}\n${text}\n${EOF}\n`);
}
