import path from "path";
import { fileURLToPath } from "url";

import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../../../../");

(async () => {
  // Resolve the output path from the repository root based on this script's location.
  const outputPath = path.resolve(repoRoot, "docs/preview.png");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 500, height: 600 },
    deviceScaleFactor: 2 // Retina scale for clearer screenshots
  });

  const page = await context.newPage();

  console.log("Navigating to Storybook...");
  try {
    await page.goto("http://127.0.0.1:6006/iframe.html?id=popup--default&viewMode=story", {
      waitUntil: "networkidle",
      timeout: 30000
    });

    // Wait for the popup container or any visible element to ensure rendering
    // Based on our styles, .popupContainer is the root
    await page.waitForSelector('div[class*="popupContainer"]', { timeout: 10000 });

    // Give it a small extra buffer for any animations or layout shifts
    await page.waitForTimeout(500);

    await page.screenshot({ path: outputPath });
    console.log(`✅ Screenshot saved to ${outputPath}`);
  } catch (error) {
    console.error(`❌ Failed to capture screenshot: ${error.message}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
