import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!window.__CHAIR_MESH, { timeout: 20000 });
  await page.waitForTimeout(1000);

  await page.evaluate(() => {
    document.getElementById("customisation")?.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(500);

  // In requestAnimationFrame, hide the THREE_SCENE children
  await page.evaluate(() => {
    window.__THREE_SCENE.visible = false;
  });

  await page.waitForTimeout(300);
  await page.screenshot({ path: "public/test_hide_three_scene.png" });
  console.log("Saved test_hide_three_scene.png");

  await browser.close();
}

main().catch(console.error);
