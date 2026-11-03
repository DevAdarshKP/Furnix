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

  // Hide the Three.js chair mesh!
  await page.evaluate(() => {
    window.__CHAIR_MESH.visible = false;
  });
  await page.waitForTimeout(300);

  await page.screenshot({ path: "public/test_hidden_mesh.png" });
  console.log("Saved test_hidden_mesh.png");
  await browser.close();
}

main().catch(console.error);
