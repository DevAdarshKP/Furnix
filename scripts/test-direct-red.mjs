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

  // Directly set the material color on Object_6 in a requestAnimationFrame loop so useFrame doesn't overwrite it
  await page.evaluate(() => {
    const mesh = window.__CHAIR_MESH;
    const uphMat = mesh.material[0];
    function keepRed() {
      uphMat.color.set("#ff0000");
      requestAnimationFrame(keepRed);
    }
    keepRed();
  });

  await page.waitForTimeout(300);
  await page.screenshot({ path: "public/test_direct_red.png" });
  console.log("Saved test_direct_red.png");
  await browser.close();
}

main().catch(console.error);
