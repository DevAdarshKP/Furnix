import { chromium } from "playwright";
import fs from "fs";

async function main() {
  console.log("Capturing all 4 3D chair views with the new sunny yellow...");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!window.__CHAIR_MESH, { timeout: 25000 });
  await page.waitForTimeout(2000);

  // VIEW 1: Editorial Section ("Crafted for living")
  console.log("1. Capturing View 1: Editorial Section (#editorial-chair-target)...");
  await page.evaluate(() => {
    document.getElementById("editorial-chair-target")?.scrollIntoView({ block: "center", behavior: "instant" });
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "public/view_1_editorial.png" });
  console.log("  Saved public/view_1_editorial.png");

  // VIEW 2: Product Detail Section ("The Bolle Lounge Chair")
  console.log("2. Capturing View 2: Product Detail Section (#product-chair-target)...");
  await page.evaluate(() => {
    document.getElementById("product-chair-target")?.scrollIntoView({ block: "center", behavior: "instant" });
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "public/view_2_detail.png" });
  console.log("  Saved public/view_2_detail.png");

  // VIEW 3: Collection Section (Bolle Lounge Chair card)
  console.log("3. Capturing View 3: Collection Section (#collections)...");
  await page.evaluate(() => {
    document.getElementById("collections")?.scrollIntoView({ block: "center", behavior: "instant" });
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "public/view_3_collection.png" });
  console.log("  Saved public/view_3_collection.png");

  // VIEW 4: Customisation Section (Yellow)
  console.log("4. Capturing View 4: Customisation Section (#customisation)...");
  await page.evaluate(() => {
    document.getElementById("customisation")?.scrollIntoView({ block: "center", behavior: "instant" });
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "public/view_4_customisation_yellow.png" });
  console.log("  Saved public/view_4_customisation_yellow.png");

  // Extract a tight crop of the yellow chair for chair_thumb_yellow.png
  console.log("5. Generating matching thumbnail for chair_thumb_yellow.png...");
  const targetHandle = await page.$("#customisation-chair-target");
  if (targetHandle) {
    const box = await targetHandle.boundingBox();
    if (box) {
      await page.screenshot({
        path: "public/images/chair_thumb_yellow.png",
        clip: {
          x: box.x + box.width * 0.15,
          y: box.y + box.height * 0.15,
          width: box.width * 0.70,
          height: box.height * 0.70,
        },
      });
      console.log("  Saved cropped thumbnail to public/images/chair_thumb_yellow.png");
    }
  }

  // Reload to see the updated swatch thumbnail in action
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!window.__CHAIR_MESH, { timeout: 25000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    document.getElementById("customisation")?.scrollIntoView({ block: "center", behavior: "instant" });
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "public/view_4_customisation_with_updated_swatch.png" });
  console.log("  Saved public/view_4_customisation_with_updated_swatch.png");

  await browser.close();
  console.log("All views captured successfully!");
}

main().catch(console.error);
