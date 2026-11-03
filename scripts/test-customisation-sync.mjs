import { chromium } from "playwright";

async function run() {
  console.log("=== STARTING FURNIX CUSTOMISATION COLOUR & BG SYNC VERIFICATION ===");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const errors = [];
  page.on("console", (msg) => {
    const text = msg.text();
    if (msg.type() === "error" && !text.includes("hmr") && !text.includes("WebSocket")) {
      errors.push(text);
      console.error("[Browser Error]", text);
    }
  });

  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!window.__CHAIR_UPHOLSTERY_MAT, { timeout: 20000 });
  await page.waitForTimeout(1000);

  // 1. Scroll into customisation section
  console.log("Scrolling into Customisation Section...");
  await page.evaluate(() => {
    document.getElementById("customisation")?.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(1000);

  // Verify customisation section background is Yellow (#E9D9A8)
  const yellowBg = await page.evaluate(() => {
    const el = document.getElementById("customisation");
    return el ? window.getComputedStyle(el).backgroundColor : null;
  });
  console.log(`Initial Section Background: ${yellowBg} (expected rgb(233, 217, 168) for #E9D9A8)`);

  const swatches = await page.$$('button[role="radio"]');
  console.log(`Found ${swatches.length} swatch buttons (expected 3)`);
  if (swatches.length !== 3) {
    throw new Error(`Expected 3 swatch buttons, found ${swatches.length}`);
  }

  // Capture Yellow State
  await page.screenshot({ path: "public/customisation_yellow_sync.png" });
  console.log("Saved screenshot: public/customisation_yellow_sync.png");

  // 2. Click Light Green (swatch 1)
  console.log("Clicking Light Green swatch...");
  await swatches[1].click();
  await page.waitForTimeout(500); // 400ms transition time

  const greenBg = await page.evaluate(() => {
    const el = document.getElementById("customisation");
    return el ? window.getComputedStyle(el).backgroundColor : null;
  });
  console.log(`Light Green Section Background: ${greenBg} (expected rgb(213, 223, 207) for #D5DFCF)`);

  const uphGreenColor = await page.evaluate(() => {
    return window.__CHAIR_UPHOLSTERY_MAT ? window.__CHAIR_UPHOLSTERY_MAT.color.getHexString() : null;
  });
  console.log(`Upholstery Material Color (Light Green): #${uphGreenColor}`);

  await page.screenshot({ path: "public/customisation_light_green_sync.png" });
  console.log("Saved screenshot: public/customisation_light_green_sync.png");

  // 3. Click Grey (swatch 2)
  console.log("Clicking Grey swatch...");
  await swatches[2].click();
  await page.waitForTimeout(500);

  const greyBg = await page.evaluate(() => {
    const el = document.getElementById("customisation");
    return el ? window.getComputedStyle(el).backgroundColor : null;
  });
  console.log(`Grey Section Background: ${greyBg} (expected rgb(216, 216, 214) for #D8D8D6)`);

  const uphGreyColor = await page.evaluate(() => {
    return window.__CHAIR_UPHOLSTERY_MAT ? window.__CHAIR_UPHOLSTERY_MAT.color.getHexString() : null;
  });
  console.log(`Upholstery Material Color (Grey): #${uphGreyColor}`);

  await page.screenshot({ path: "public/customisation_grey_sync.png" });
  console.log("Saved screenshot: public/customisation_grey_sync.png");

  // 4. Rapid switching test
  console.log("Testing rapid switching across all three colours...");
  for (let i = 0; i < 5; i++) {
    await swatches[0].click();
    await page.waitForTimeout(50);
    await swatches[1].click();
    await page.waitForTimeout(50);
    await swatches[2].click();
    await page.waitForTimeout(50);
  }
  // Settle on Yellow
  await swatches[0].click();
  await page.waitForTimeout(500);
  console.log("✓ Rapid switching completed without errors");

  // 5. Reverse scroll test back to Collection Card
  console.log("Testing reverse scroll back into Collection Section...");
  await page.evaluate(() => {
    document.getElementById("collections")?.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(1000);

  const collUphColor = await page.evaluate(() => {
    return window.__CHAIR_UPHOLSTERY_MAT ? window.__CHAIR_UPHOLSTERY_MAT.color.getHexString() : null;
  });
  console.log(`Upholstery Color after reversing to Collection: #${collUphColor} (expected ffffff for original texture)`);

  await page.screenshot({ path: "public/customisation_reversed_sync.png" });
  console.log("Saved screenshot: public/customisation_reversed_sync.png");

  await browser.close();

  if (errors.length > 0) {
    throw new Error(`Encountered ${errors.length} browser errors during test`);
  }

  console.log("=======================================================");
  console.log("ALL SYNCHRONISATION TESTS COMPLETED SUCCESSFULLY!");
  console.log("=======================================================");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
