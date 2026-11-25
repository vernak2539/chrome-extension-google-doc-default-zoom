/**
 * Writes the SUBMIT_ENV secret to `.env.submit`, the file `wxt submit` reads from the working directory.
 *
 * Each edition's GitHub environment (`build-package`, `build-package-extended`) holds its own
 * SUBMIT_ENV: the contents of that edition's local `.env.submit.<edition>` file, in the format
 * `wxt submit init` writes. Before writing the
 * file this checks that its store IDs are the listings the workflow submits this edition to, so one
 * edition's file can't publish to the other edition's listings, and masks every credential in the log.
 */

import { writeFileSync } from "node:fs";
import { parseEnv } from "node:util";

const fail = (message) => {
  console.log(`::error::${message}`);
  process.exit(1);
};

const environment = process.env.ENVIRONMENT;
const edition = process.env.EDITION;
const submitEnv = process.env.SUBMIT_ENV ?? "";

if (submitEnv.trim() === "") {
  fail(
    `The ${environment} environment has no SUBMIT_ENV secret. Set it with: gh secret set SUBMIT_ENV --env ${environment} < .env.submit.${edition}`
  );
}

// The same parser `wxt submit` uses for `.env.submit`
const env = parseEnv(submitEnv);

const expected = {
  CHROME_EXTENSION_ID: process.env.EXPECTED_CHROME_EXTENSION_ID,
  EDGE_PRODUCT_ID: process.env.EXPECTED_EDGE_PRODUCT_ID
};
if (process.env.INCLUDE_FIREFOX === "true") {
  expected.FIREFOX_EXTENSION_ID = process.env.EXPECTED_FIREFOX_EXTENSION_ID;
}

for (const [key, value] of Object.entries(expected)) {
  if (!value) fail(`The workflow gives no expected ${key}`);
  if (env[key] !== value) {
    fail(
      `SUBMIT_ENV in ${environment} has ${key}=${env[key] ?? "(missing)"}, but this edition's listing is ${value}`
    );
  }
}

// Mask credentials only: masking a store ID or a value like "false" would redact unrelated log text.
// A multiline value (the service-account private key) is masked line by line, except its PEM
// header and footer, which are the same in every key.
const CREDENTIAL =
  /(CLIENT_ID|CLIENT_SECRET|REFRESH_TOKEN|API_KEY|JWT_ISSUER|JWT_SECRET|SERVICE_ACCOUNT_[A-Z_]+|SESSION_ID)$/;
for (const [key, value] of Object.entries(env)) {
  if (!CREDENTIAL.test(key)) continue;
  for (const line of value.split(/\r?\n/)) {
    const text = line.trim();
    if (text !== "" && !text.startsWith("-----")) console.log(`::add-mask::${text}`);
  }
}

writeFileSync(".env.submit", submitEnv.endsWith("\n") ? submitEnv : `${submitEnv}\n`, {
  mode: 0o600
});
console.log(
  `Wrote .env.submit from the ${environment} environment (${Object.keys(env).length} variables)`
);
