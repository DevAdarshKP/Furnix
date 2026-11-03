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

  // Hide the Canvas element completely
  await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    if (canvas) canvas.style.display = "none";
  });
  await page.waitForTimeout(300);

  await page.screenshot({ path: "public/test_hide_canvas.png" });
  console.log("Saved test_hide_canvas.png");
  await browser.close();
}

main().catch(console.error);
