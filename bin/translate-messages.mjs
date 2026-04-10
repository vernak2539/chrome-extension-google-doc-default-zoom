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

  const localesDir = path.resolve(__dirname, "../locales");
  const sourceFile = path.join(localesDir, "en/messages.json");

  if (!fs.existsSync(sourceFile)) {
    console.error(`Error: Source file ${sourceFile} not found!`);
    process.exit(1);
  }

  const sourceMessages = JSON.parse(fs.readFileSync(sourceFile, "utf8"));

  console.log("🚀 Starting translation of extension messages...");
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
        if (!targetMessages[key]) {
          keysToTranslate.push(key);
        }
      }
    }

    if (keysToTranslate.length === 0) {
      console.log(`✅ ${lang.name} (${lang.code}) is up to date.`);
      continue;
    }

    console.log(`🔄 Translating ${keysToTranslate.length} keys to ${lang.name} (${lang.code})...`);

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

  console.log("🎉 All translations completed!");
}

main().catch((error) => {
  console.error("Fatal error:", error.message);
  process.exit(1);
});
