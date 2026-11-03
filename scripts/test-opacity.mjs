import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  await page.waitForFunction(() => !!window.__CHAIR_UPHOLSTERY_MAT, { timeout: 15000 });
  await page.evaluate(() => {
    document.getElementById("customisation")?.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(500);

  await page.evaluate(() => {
    const mat = window.__CHAIR_UPHOLSTERY_MAT;
    mat.transparent = true;
    mat.opacity = 0.0;
    mat.needsUpdate = true;
  });
  await page.waitForTimeout(500);

  await page.screenshot({ path: "public/test_opacity_zero.png" });
  console.log("Saved test_opacity_zero.png");
  await browser.close();
}

main().catch(console.error);
