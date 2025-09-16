import pkg from "@google-cloud/translate";
import fs from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
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
  .usage("Usage: $0 --listing=<value>")
  .example("$0 --listing=base", "Translate docs/store-listings/base/en.md")
  .example(
    "$0 --listing=extended",
    "Translate docs/store-listings/extended/en.md"
  )
  .help()
  .alias("help", "h")
  .version(false).argv;

// Define languages to translate to (matching shell script)
const LANGUAGES = [
  { code: "de", name: "German" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "ru", name: "Russian" }
];

async function main() {
  const { listing } = argv;

  // Set source file and output directory based on listing type
  const sourceFile = path.resolve(
    __dirname,
    `../docs/store-listings/${listing}/en.md`
  );
  const outputDir = path.resolve(
    __dirname,
    `../docs/store-listings/${listing}`
  );

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
  console.log("");

  // Translate to each target language
  for (const lang of LANGUAGES) {
    const outputFile = path.join(outputDir, `${lang.code}.md`);

    console.log(`🔄 Translating to ${lang.name} (${lang.code})...`);

    try {
      const [result] = await translate.translate(sourceContent, lang.code);

      // Write translated content to file
      fs.writeFileSync(outputFile, result, "utf8");

      console.log(`✅ Successfully translated to ${lang.code}.md`);
    } catch (error) {
      console.error(
        `❌ Failed to translate to ${lang.name} (${lang.code}):`,
        error.message
      );
      process.exit(1);
    }

    console.log("");
  }

  console.log("🎉 All translations completed!");
  console.log("");
  console.log("📁 Generated files:");
  for (const lang of LANGUAGES) {
    const outputFile = path.join(outputDir, `${lang.code}.md`);
    if (fs.existsSync(outputFile)) {
      console.log(`   - docs/store-listings/${listing}/${lang.code}.md`);
    }
  }
}

main().catch((error) => {
  console.error("Fatal error:", error.message);
  process.exit(1);
});
