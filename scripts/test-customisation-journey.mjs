import { chromium } from "playwright";

async function runTest() {
  console.log("=== STARTING FURNIX CHAIR CUSTOMISATION SECTION VERIFICATION ===");
  const browser = await chromium.launch({ channel: "chrome", headless: true });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  // Track console errors
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
      console.error("[Browser Error]", msg.text());
    }
  });

  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500); // Allow 3D canvas and model to initialize

  // 1. Verify existence of the customisation section
  const customSection = await page.$("#customisation");
  if (!customSection) {
    throw new Error("Customisation section #customisation not found in DOM!");
  }
  console.log("✓ Test 1: #customisation section successfully located in DOM");

  const customTarget = await page.$("#customisation-chair-target");
  if (!customTarget) {
    throw new Error("#customisation-chair-target not found in DOM!");
  }
  console.log("✓ Test 2: #customisation-chair-target container verified");

  // 2. Scroll into the Customisation Section
  console.log("Scrolling into Customisation Section...");
  await page.evaluate(() => {
    const el = document.getElementById("customisation");
    if (el) el.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(1000);

  // 3. Verify all 3 swatches are present and Yellow is selected by default
  const swatches = await page.$$('button[role="radio"]');
  console.log(`Found ${swatches.length} colour swatch buttons (expected 3)`);
  if (swatches.length !== 3) {
    throw new Error(`Expected 3 swatch buttons, found ${swatches.length}`);
  }

  // Verify Yellow is default active swatch
  const firstChecked = await swatches[0].getAttribute("aria-checked");
  console.log(`Default active state (swatch 0 Yellow): aria-checked=${firstChecked}`);
  if (firstChecked !== "true") {
    throw new Error(`Expected swatch 0 (Yellow) to be selected by default, got ${firstChecked}`);
  }

  // Check that no broken images exist in swatches
  const brokenImages = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('#customisation img'));
    return imgs.filter(img => img.style.display !== 'none' && img.naturalWidth === 0).length;
  });
  console.log(`Broken images in customisation section: ${brokenImages}`);
  if (brokenImages > 0) {
    throw new Error(`Detected ${brokenImages} broken image(s) in customisation section!`);
  }

  // Capture default state (Yellow)
  await page.screenshot({ path: "public/customisation_yellow.png" });
  await page.screenshot({ path: "public/customisation_exact_reference.png" });
  console.log("Saved screenshot: public/customisation_yellow.png & public/customisation_exact_reference.png");

  // 4. Click Light Green
  console.log("Testing Light Green selection...");
  await swatches[1].click();
  await page.waitForTimeout(600); // Allow 300ms transition to settle
  await page.screenshot({ path: "public/customisation_light_green.png" });
  console.log("Saved screenshot: public/customisation_light_green.png");

  // 5. Click Grey
  console.log("Testing Grey selection...");
  await swatches[2].click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: "public/customisation_grey.png" });
  console.log("Saved screenshot: public/customisation_grey.png");

  // 6. Click back to Yellow
  console.log("Testing Yellow restore...");
  await swatches[0].click();
  await page.waitForTimeout(600);

  // 8. Test Reverse Scrolling: Scroll back up into Collection Section
  console.log("Testing reverse scroll back into Collection Section...");
  await page.evaluate(() => {
    const el = document.getElementById("collections");
    if (el) el.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "public/customisation_reversed_collection.png" });
  console.log("Saved screenshot: public/customisation_reversed_collection.png");

  // 9. Test Responsive Viewports (Tablet & Mobile)
  console.log("Testing Tablet (768x1024)...");
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.evaluate(() => {
    const el = document.getElementById("customisation-chair-target");
    if (el) el.scrollIntoView({ block: "center", behavior: "instant" });
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: "public/customisation_tablet_768.png" });
  console.log("Saved screenshot: public/customisation_tablet_768.png");

  console.log("Testing Mobile (390x844)...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    const el = document.getElementById("customisation-chair-target");
    if (el) el.scrollIntoView({ block: "center", behavior: "instant" });
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: "public/customisation_mobile_390.png" });
  console.log("Saved screenshot: public/customisation_mobile_390.png");

  await browser.close();

  if (errors.length > 0) {
    console.warn(`Encountered ${errors.length} browser errors during test run`);
  }

  console.log("=======================================================");
  console.log("ALL CUSTOMISATION TESTS AND SCREENSHOTS COMPLETED!");
  console.log("=======================================================");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
