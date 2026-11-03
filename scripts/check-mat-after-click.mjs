import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  await page.evaluate(() => {
    document.getElementById("customisation")?.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(500);

  const swatches = await page.$$('button[role="radio"]');
  await swatches[1].click(); // click green
  await page.waitForTimeout(1000);

  const matState = await page.evaluate(() => {
    const uph = window.__CHAIR_UPHOLSTERY_MAT;
    return {
      colorHex: uph.color.getHexString(),
      mapType: uph.map ? uph.map.constructor.name : null,
      mapImageSrc: uph.map?.image?.src || (uph.map?.image ? uph.map.image.constructor.name : null),
      mapNeedsUpdate: uph.map?.needsUpdate,
      matNeedsUpdate: uph.needsUpdate,
    };
  });

  console.log("MAT STATE AFTER GREEN CLICK:", matState);
  await browser.close();
}

main().catch(console.error);
