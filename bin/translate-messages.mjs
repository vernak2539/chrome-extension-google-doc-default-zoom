import fs from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import pkg from "@google-cloud/translate";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { LANGUAGES } from "./translate-config.mjs";

const { Translate } = pkg.v2;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const translate = new Translate();

// This message is display text only (the popup stores "fit"), but it should be the text Docs shows, not a translation of "Fit".
// `pnpm e2e:capture` records that text from live Docs in each language.
const FIT_KEY = "popupDocsDropdownFitSelection";
const FIT_LABELS_FILE = path.resolve(__dirname, "../src/strategies/docs-fit-labels.json");

// Configure yargs for argument parsing
const argv = yargs(hideBin(process.argv))
  .option("key", {
    describe: "Specific key to translate (overrides diff detection)",
    type: "string"
  })
  .help()
  .alias("help", "h")
  .version(false).argv;

async function main() {
  const { key: targetKey } = argv;

  const localesDir = path.resolve(__dirname, "../public/_locales");
  const sourceFile = path.join(localesDir, "en/messages.json");

  if (!fs.existsSync(sourceFile)) {
    console.error(`Error: Source file ${sourceFile} not found!`);
    process.exit(1);
  }

  const sourceMessages = JSON.parse(fs.readFileSync(sourceFile, "utf8"));

  console.log("🚀 Starting translation of extension messages...");
  if (targetKey === FIT_KEY) {
    console.error(
      `Error: ${FIT_KEY} is never machine-translated. A missing one is copied from ` +
        "src/strategies/docs-fit-labels.json, which `pnpm e2e:capture` records from live Docs."
    );
    process.exit(1);
  }

  const fitLabels = fs.existsSync(FIT_LABELS_FILE)
    ? JSON.parse(fs.readFileSync(FIT_LABELS_FILE, "utf8"))
    : {};
  const missingFitLabels = [];

  if (targetKey) {
    console.log(`🎯 Targeted key: ${targetKey}`);
    if (!sourceMessages[targetKey]) {
      console.error(`Error: Key "${targetKey}" not found in English source!`);
      process.exit(1);
    }
  } else {
    console.log("🔍 Mode: Diff detection (translating missing keys)");
  }
  console.log("");

  for (const lang of LANGUAGES) {
    const targetFilePath = path.join(localesDir, `${lang.code}/messages.json`);
    const targetDir = path.dirname(targetFilePath);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    let targetMessages = {};
    if (fs.existsSync(targetFilePath)) {
      targetMessages = JSON.parse(fs.readFileSync(targetFilePath, "utf8"));
    }

    const keysToTranslate = [];
    if (targetKey) {
      keysToTranslate.push(targetKey);
    } else {
      for (const key of Object.keys(sourceMessages)) {
        if (!targetMessages[key] && key !== FIT_KEY) {
          keysToTranslate.push(key);
        }
      }
    }

    // A Fit label that exists is never replaced, so a run can't replace a label that was checked against Docs
    let addedFitLabel = false;
    if (!targetMessages[FIT_KEY]) {
      if (fitLabels[lang.code]) {
        targetMessages[FIT_KEY] = {
          message: fitLabels[lang.code],
          description: sourceMessages[FIT_KEY].description
        };
        addedFitLabel = true;
        console.log(`   - [${FIT_KEY}] copied from src/strategies/docs-fit-labels.json.`);
      } else {
        missingFitLabels.push(lang.code);
      }
    }

    if (keysToTranslate.length === 0 && !addedFitLabel) {
      console.log(`✅ ${lang.name} (${lang.code}) is up to date.`);
      continue;
    }

    if (keysToTranslate.length > 0) {
      console.log(
        `🔄 Translating ${keysToTranslate.length} keys to ${lang.name} (${lang.code})...`
      );
    }

    for (const key of keysToTranslate) {
      const sourceEntry = sourceMessages[key];
      try {
        const [translatedMessage] = await translate.translate(sourceEntry.message, lang.code);
        targetMessages[key] = {
          message: translatedMessage,
          description: sourceEntry.description
        };
        console.log(`   - [${key}] translated.`);
      } catch (error) {
        console.error(`❌ Failed to translate key "${key}" to ${lang.code}:`, error.message);
        process.exit(1);
      }
    }

    fs.writeFileSync(targetFilePath, JSON.stringify(targetMessages, null, 2), "utf8");
    console.log(`✅ Successfully updated ${lang.code}/messages.json`);
    console.log("");
  }

  if (missingFitLabels.length > 0) {
    console.warn(
      `⚠️  No Docs Fit label recorded for ${missingFitLabels.join(", ")}, so ${FIT_KEY} was left out. ` +
        "Run `pnpm e2e:capture`, then run this script again."
    );
    process.exitCode = 1;
  }

  console.log("🎉 All translations completed!");
}

main().catch((error) => {
  console.error("Fatal error:", error.message);
  process.exit(1);
});
