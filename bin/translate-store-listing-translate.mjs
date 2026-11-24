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
  .option("listing", {
    describe: "Type of store listing to translate",
    choices: ["base", "extended"],
    demandOption: true,
    type: "string"
  })
  .option("force", {
    describe: "Language code(s) to re-translate even though their listing exists",
    type: "string",
    array: true,
    default: []
  })
  .usage("Usage: $0 --listing=<value> [--force=<code>[,<code>]]")
  .example(
    "$0 --listing=base",
    "Translate docs/store-listings/base/en.md into each missing language"
  )
  .example("$0 --listing=extended --force=he", "Also re-translate the existing Hebrew listing")
  .help()
  .alias("help", "h")
  .version(false).argv;

async function main() {
  const { listing } = argv;
  const force = new Set(argv.force.flatMap((value) => value.split(",")).filter(Boolean));

  const unknownCodes = [...force].filter((code) => !LANGUAGES.some((lang) => lang.code === code));
  if (unknownCodes.length > 0) {
    console.error(
      `Error: --force got ${unknownCodes.join(", ")}, which bin/translate-config.mjs does not list ` +
        `(${LANGUAGES.map((lang) => lang.code).join(", ")})`
    );
    process.exit(1);
  }

  // Set source file and output directory based on listing type
  const sourceFile = path.resolve(__dirname, `../docs/store-listings/${listing}/en.md`);
  const outputDir = path.resolve(__dirname, `../docs/store-listings/${listing}`);

  // Ensure source file exists
  if (!fs.existsSync(sourceFile)) {
    console.error(`Error: Source file ${sourceFile} not found!`);
    process.exit(1);
  }

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  // Read source content
  const sourceContent = fs.readFileSync(sourceFile, "utf8");

  console.log("🚀 Starting translation of store listing...");
  console.log(`📄 Source: docs/store-listings/${listing}/en.md`);
  console.log(`📁 Output directory: docs/store-listings/${listing}`);
  console.log(
    force.size > 0
      ? `🎯 Re-translating: ${[...force].join(", ")}, plus any missing language`
      : "🔍 Mode: missing languages only"
  );
  console.log("");

  const written = [];

  // Translate to each target language that has no listing yet, or that --force names
  for (const lang of LANGUAGES) {
    const outputFile = path.join(outputDir, `${lang.code}.md`);

    if (fs.existsSync(outputFile) && !force.has(lang.code)) {
      console.log(
        `✅ ${lang.name} (${lang.code}) already has a listing. Pass --force=${lang.code} to re-translate it.`
      );
      continue;
    }

    console.log(`🔄 Translating to ${lang.name} (${lang.code})...`);

    try {
      const [result] = await translate.translate(sourceContent, lang.code);

      // Write translated content to file
      fs.writeFileSync(outputFile, result, "utf8");
      written.push(`docs/store-listings/${listing}/${lang.code}.md`);

      console.log(`✅ Successfully translated to ${lang.code}.md`);
    } catch (error) {
      console.error(`❌ Failed to translate to ${lang.name} (${lang.code}):`, error.message);
      process.exit(1);
    }

    console.log("");
  }

  console.log("");
  if (written.length === 0) {
    console.log("🎉 Every language already has a listing. Nothing was translated.");
    return;
  }

  console.log("🎉 All translations completed!");
  console.log("");
  console.log("📁 Generated files:");
  for (const file of written) {
    console.log(`   - ${file}`);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error.message);
  process.exit(1);
});
