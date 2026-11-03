import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!window.__CHAIR_MESH, { timeout: 15000 });

  await page.evaluate(() => {
    document.getElementById("customisation")?.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(500);

  // Set map = null and color = cyan #00ffff on upholsteryMaterial
  await page.evaluate(() => {
    const mesh = window.__CHAIR_MESH;
    const uphMat = mesh.material[0];
    uphMat.map = null;
    uphMat.color.set("#00ffff");
    uphMat.needsUpdate = true;
  });

  await page.waitForTimeout(500);
  await page.screenshot({ path: "public/test_null_map.png" });
  console.log("Saved test_null_map.png");
  await browser.close();
}

main().catch(console.error);
