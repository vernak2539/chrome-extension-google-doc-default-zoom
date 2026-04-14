import path from "path";
import { fileURLToPath } from "url";

import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../../../../");

(async () => {
  const outputPath = path.resolve(repoRoot, "docs/preview.png");
  const storybookUrl = "http://127.0.0.1:6006";

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 500, height: 600 },
    deviceScaleFactor: 2
  });

  const page = await context.newPage();

  try {
    console.log("Fetching Storybook index...");
    const response = await page.goto(`${storybookUrl}/index.json`);
    const index = await response.json();

    // Prioritize Popup, then Button, then anything else that isn't docs
    const storyId =
      Object.keys(index.entries).find((id) => id.includes("popup") && !id.includes("--docs")) ||
      Object.keys(index.entries).find((id) => id.includes("button") && !id.includes("--docs")) ||
      Object.keys(index.entries).find((id) => !id.includes("--docs"));

    if (!storyId) {
      throw new Error("No stories found in index.json");
    }

    console.log(`Navigating to story: ${storyId}...`);
    await page.goto(`${storybookUrl}/iframe.html?id=${storyId}&viewMode=story`, {
      waitUntil: "networkidle",
      timeout: 30000
    });

    // Flexible wait logic
    const selectors = ["main", "button", "h1:not(.sb-nopreview_heading)", "select", "input"];
    let found = false;
    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        console.log(`Matched selector: ${selector}`);
        found = true;
        break;
      } catch (e) {
        continue;
      }
    }

    if (!found) {
      console.log("No specific element found, taking screenshot anyway...");
    }

    await page.waitForTimeout(1000);
    await page.screenshot({ path: outputPath });
    console.log(`✅ Screenshot saved to ${outputPath}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Failed to capture screenshot: ${errorMessage}`);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
