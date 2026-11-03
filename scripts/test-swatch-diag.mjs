import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto("http://127.0.0.1:3000");
  await page.waitForTimeout(1500);

  // Scroll to customisation
  await page.evaluate(() => {
    document.getElementById("customisation").scrollIntoView();
  });
  await page.waitForTimeout(800);

  const swatches = await page.$$('button[role="radio"]');

  // Click Light Green (swatch 1)
  console.log("Clicking Light Green...");
  await swatches[1].click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: "public/test_light_green_color.png" });

  // Click Grey (swatch 2)
  console.log("Clicking Grey...");
  await swatches[2].click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: "public/test_grey_color.png" });

  console.log("Screenshots saved successfully!");
  await browser.close();
}

run().catch(console.error);
