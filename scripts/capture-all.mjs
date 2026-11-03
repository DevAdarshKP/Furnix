import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!window.__CHAIR_UPHOLSTERY_MAT, { timeout: 15000 });

  await page.evaluate(() => {
    document.getElementById("customisation")?.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(600);

  const swatches = await page.$$('button[role="radio"]');

  // 1. Yellow
  await page.screenshot({ path: "public/final_yellow.png" });

  // 2. Click Green
  await swatches[1].click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: "public/final_green.png" });

  // 3. Click Grey
  await swatches[2].click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: "public/final_grey.png" });

  await browser.close();
  console.log("Captured final_yellow.png, final_green.png, final_grey.png");
}

main().catch(console.error);
