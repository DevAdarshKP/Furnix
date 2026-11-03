import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  await page.evaluate(() => {
    document.getElementById("customisation")?.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(500);

  const swatches = await page.$$('button[role="radio"]');
  await swatches[1].click(); // click Green

  // Wait 1000ms for lerp to fully complete
  await page.waitForTimeout(1000);

  const c = await page.evaluate(() => window.__CHAIR_UPHOLSTERY_MAT.color.getHexString());
  console.log(`Color at screenshot time: #${c}`);

  await page.screenshot({ path: "public/test_frame4_green.png" });
  console.log("Saved test_frame4_green.png");

  await browser.close();
}

main().catch(console.error);
