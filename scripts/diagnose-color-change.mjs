import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!window.__CHAIR_UPHOLSTERY_MAT, { timeout: 15000 });

  await page.evaluate(() => {
    document.getElementById("customisation")?.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(500);

  const swatches = await page.$$('button[role="radio"]');
  console.log("Swatches count:", swatches.length);

  // Click Grey (index 2)
  await swatches[2].click();
  console.log("Clicked swatch 2 (Grey)");

  for (let i = 0; i < 5; i++) {
    await page.waitForTimeout(200);
    const c = await page.evaluate(() => window.__CHAIR_UPHOLSTERY_MAT.color.getHexString());
    console.log(`matColor after ${(i + 1) * 200}ms: #${c}`);
  }

  await page.screenshot({ path: "public/test_grey_after_click.png" });

  // Click Light Green (index 1)
  await swatches[1].click();
  console.log("Clicked swatch 1 (Light Green)");

  for (let i = 0; i < 5; i++) {
    await page.waitForTimeout(200);
    const c = await page.evaluate(() => window.__CHAIR_UPHOLSTERY_MAT.color.getHexString());
    console.log(`matColor after ${(i + 1) * 200}ms: #${c}`);
  }

  await page.screenshot({ path: "public/test_green_after_click.png" });

  await browser.close();
}

main().catch(console.error);
