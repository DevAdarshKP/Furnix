import { chromium } from "playwright";
import fs from "fs";

async function generateThumbnails() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // Scroll to customisation
  await page.evaluate(() => {
    const el = document.getElementById("customisation-chair-target");
    if (el) el.scrollIntoView({ block: "center", behavior: "instant" });
  });
  await page.waitForTimeout(600);

  const colors = [
    { id: "charcoal", index: 1 },
    { id: "natural-oat", index: 0 },
    { id: "sage", index: 2 },
    { id: "saffron", index: 3 },
  ];

  const chairTarget = await page.locator("#customisation-chair-target");
  const box = await chairTarget.boundingBox();
  console.log("Target box:", box);

  const swatches = await page.locator('button[role="radio"]').all();

  for (const c of colors) {
    if (swatches[c.index]) {
      await swatches[c.index].click();
      await page.waitForTimeout(400);

      await page.screenshot({
        path: `public/images/chair_thumb_${c.id}.png`,
        clip: {
          x: box.x + box.width * 0.18,
          y: box.y + box.height * 0.12,
          width: box.width * 0.64,
          height: box.height * 0.70,
        },
      });
      console.log(`Saved public/images/chair_thumb_${c.id}.png`);
    }
  }

  await browser.close();
}

generateThumbnails().catch(console.error);
