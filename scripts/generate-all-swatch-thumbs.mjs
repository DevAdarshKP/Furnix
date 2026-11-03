import { chromium } from "playwright";

async function generateAllThumbs() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // Set white background and scroll to customisation chair target
  await page.evaluate(() => {
    document.body.style.background = "#FFFFFF";
    const cust = document.getElementById("customisation");
    if (cust) cust.style.background = "#FFFFFF";
    const target = document.getElementById("customisation-chair-target");
    if (target) target.scrollIntoView({ block: "center", behavior: "instant" });
  });
  await page.waitForTimeout(800);

  const target = await page.locator("#customisation-chair-target");
  const box = await target.boundingBox();

  const colorList = ["charcoal", "ocean-blue", "saffron", "natural-oat"];
  const buttons = await page.locator('button[role="radio"]').all();

  for (let i = 0; i < colorList.length; i++) {
    const id = colorList[i];
    if (buttons[i]) {
      await buttons[i].click();
      await page.waitForTimeout(600); // Allow smooth Three.js material lerp to complete

      await page.screenshot({
        path: `public/images/chair_thumb_${id}.png`,
        clip: {
          x: box.x + box.width * 0.16,
          y: box.y + box.height * 0.08,
          width: box.width * 0.68,
          height: box.height * 0.74,
        },
      });
      console.log(`Saved public/images/chair_thumb_${id}.png`);
    }
  }

  await browser.close();
  console.log("All thumbnails generated successfully!");
}

generateAllThumbs().catch(console.error);
