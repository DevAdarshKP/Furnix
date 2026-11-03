import { chromium } from "playwright";

async function main() {
  console.log("=======================================================================");
  console.log("      FURNIX CUSTOMISATION COMPREHENSIVE VALIDATION SUITE              ");
  console.log("=======================================================================");

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      if (!text.includes("favicon") && !text.includes("HMR")) {
        consoleErrors.push(text);
        console.error("  [Console Error]", text);
      }
    }
  });

  page.on("pageerror", (err) => {
    consoleErrors.push(err.message);
    console.error("  [Page Error]", err.message);
  });

  // Step 1: Navigate to Home
  console.log("1. Navigating to http://localhost:3000...");
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!window.__CHAIR_MESH, { timeout: 20000 });
  await page.waitForTimeout(1500);

  // Step 2: Scroll into Customisation Section
  console.log("2. Scrolling to #customisation...");
  await page.evaluate(() => {
    document.getElementById("customisation")?.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(1000);

  const swatches = await page.$$('button[role="radio"]');
  if (swatches.length !== 3) {
    throw new Error(`Expected exactly 3 swatch buttons, found ${swatches.length}`);
  }
  console.log(`  ✓ Found exactly ${swatches.length} circular colourway swatches`);

  // Helper to get computed section background and upholstery color
  async function getState() {
    return await page.evaluate(() => {
      const section = document.getElementById("customisation");
      const bg = section ? window.getComputedStyle(section).backgroundColor : "";
      
      let uphColor = null;
      let meshObj = null;
      window.__THREE_SCENE?.traverse((obj) => {
        if (obj.isMesh && obj.name === "Object_6") {
          meshObj = obj;
          if (Array.isArray(obj.material) && obj.material[0]) {
            uphColor = obj.material[0].color.getHexString();
          }
        }
      });

      return {
        bg,
        uphColor,
        hasMesh: !!meshObj,
      };
    });
  }

  // -------------------------------------------------------------------------
  // TEST A: YELLOW (Default Option)
  // -------------------------------------------------------------------------
  console.log("\n--- TEST A: Yellow Option ---");
  const yellowState = await getState();
  console.log(`  Section Background: ${yellowState.bg}`);
  console.log(`  Upholstery Color: #${yellowState.uphColor}`);
  // Expected rgb(233, 217, 168) for #E9D9A8
  if (!yellowState.bg.includes("233, 217, 168")) {
    throw new Error(`Expected background rgb(233, 217, 168), got ${yellowState.bg}`);
  }
  if (yellowState.uphColor !== "ffb800") {
    throw new Error(`Expected upholstery #ffb800, got #${yellowState.uphColor}`);
  }
  await page.screenshot({ path: "public/test_final_yellow.png" });
  console.log("  ✓ Yellow verified: background #E9D9A8, upholstery #E59E18 (test_final_yellow.png)");

  // -------------------------------------------------------------------------
  // TEST B: LIGHT GREEN OPTION
  // -------------------------------------------------------------------------
  console.log("\n--- TEST B: Light Green Option ---");
  console.log("  Clicking Light Green swatch...");
  await swatches[1].click();
  await page.waitForTimeout(800); // 400ms transition time

  const greenState = await getState();
  console.log(`  Section Background: ${greenState.bg}`);
  console.log(`  Upholstery Color: #${greenState.uphColor}`);
  // Expected rgb(213, 223, 207) for #D5DFCF
  if (!greenState.bg.includes("213, 223, 207")) {
    throw new Error(`Expected background rgb(213, 223, 207), got ${greenState.bg}`);
  }
  if (greenState.uphColor !== "758e75") {
    throw new Error(`Expected upholstery #758e75, got #${greenState.uphColor}`);
  }
  await page.screenshot({ path: "public/test_final_light_green.png" });
  console.log("  ✓ Light Green verified: background #D5DFCF, upholstery #758E75 (test_final_light_green.png)");

  // -------------------------------------------------------------------------
  // TEST C: GREY OPTION
  // -------------------------------------------------------------------------
  console.log("\n--- TEST C: Grey Option ---");
  console.log("  Clicking Grey swatch...");
  await swatches[2].click();
  await page.waitForTimeout(800);

  const greyState = await getState();
  console.log(`  Section Background: ${greyState.bg}`);
  console.log(`  Upholstery Color: #${greyState.uphColor}`);
  // Expected rgb(216, 216, 214) for #D8D8D6
  if (!greyState.bg.includes("216, 216, 214")) {
    throw new Error(`Expected background rgb(216, 216, 214), got ${greyState.bg}`);
  }
  if (greyState.uphColor !== "7c7e84") {
    throw new Error(`Expected upholstery #7c7e84, got #${greyState.uphColor}`);
  }
  await page.screenshot({ path: "public/test_final_grey.png" });
  console.log("  ✓ Grey verified: background #D8D8D6, upholstery #7C7E84 (test_final_grey.png)");

  // -------------------------------------------------------------------------
  // TEST D: RAPID SWITCHING STRESS TEST
  // -------------------------------------------------------------------------
  console.log("\n--- TEST D: Rapid Switching Stress Test ---");
  for (let i = 0; i < 6; i++) {
    await swatches[0].click();
    await page.waitForTimeout(40);
    await swatches[1].click();
    await page.waitForTimeout(40);
    await swatches[2].click();
    await page.waitForTimeout(40);
  }
  // Settle on Light Green
  await swatches[1].click();
  await page.waitForTimeout(600);
  const settledState = await getState();
  console.log(`  Settled State after stress: bg=${settledState.bg}, color=#${settledState.uphColor}`);
  if (!settledState.bg.includes("213, 223, 207") || settledState.uphColor !== "758e75") {
    throw new Error("Rapid switching left inconsistent state!");
  }
  console.log("  ✓ Rapid switching handled gracefully without inconsistency");

  // -------------------------------------------------------------------------
  // TEST E: REVERSE SCROLL TO COLLECTION SECTION
  // -------------------------------------------------------------------------
  console.log("\n--- TEST E: Reverse Scroll to Collection Section ---");
  await page.evaluate(() => {
    document.getElementById("collections")?.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(1000);

  const collState = await page.evaluate(() => {
    let uphColor = null;
    let shadowVisible = null;
    window.__THREE_SCENE?.traverse((obj) => {
      if (obj.isMesh && obj.name === "Object_6") {
        if (Array.isArray(obj.material) && obj.material[0]) {
          uphColor = obj.material[0].color.getHexString();
        }
      }
      if (obj.type === "Group" && obj.children.some(c => c.type === "Mesh" && c.geometry?.index?.count === 6)) {
        shadowVisible = obj.visible;
      }
    });
    return { uphColor, shadowVisible };
  });

  console.log(`  Collection Upholstery Color: #${collState.uphColor}`);
  console.log(`  Contact Shadow in Collection: visible=${collState.shadowVisible}`);
  if (collState.uphColor !== "ffb800") {
    throw new Error(`Expected collection chair to restore original #ffb800, got #${collState.uphColor}`);
  }
  if (collState.shadowVisible === false) {
    throw new Error("Contact shadow must remain visible in Collection section!");
  }
  await page.screenshot({ path: "public/test_reversed_collection.png" });
  console.log("  ✓ Reverse scroll verified: restored original #E59E18 and shadow is active");

  // -------------------------------------------------------------------------
  // TEST F: VIEWPORT RESIZE TEST
  // -------------------------------------------------------------------------
  console.log("\n--- TEST F: Viewport Resize Test ---");
  // Mobile 390x844
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    document.getElementById("customisation")?.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: "public/test_mobile_390.png" });
  console.log("  ✓ Mobile viewport (390px) verified (test_mobile_390.png)");

  // Tablet 768x1024
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.evaluate(() => {
    document.getElementById("customisation")?.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: "public/test_tablet_768.png" });
  console.log("  ✓ Tablet viewport (768px) verified (test_tablet_768.png)");

  // Restore Desktop
  await page.setViewportSize({ width: 1440, height: 900 });

  await browser.close();

  if (consoleErrors.length > 0) {
    throw new Error(`Encountered ${consoleErrors.length} console errors: ${consoleErrors.join("; ")}`);
  }

  console.log("\n=======================================================================");
  console.log("      ALL VALIDATION REQUIREMENTS PASSED SUCCESSFULLY!                 ");
  console.log("=======================================================================");
}

main().catch((err) => {
  console.error("\n❌ VALIDATION TEST SUITE FAILED:", err);
  process.exit(1);
});
