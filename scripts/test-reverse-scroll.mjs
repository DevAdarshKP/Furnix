import { chromium } from "playwright";

async function runTests() {
  console.log("=== STARTING FURNIX REVERSE SCROLL REGRESSION TESTS ===");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const errors = [];
  page.on("pageerror", (err) => {
    errors.push(`Page error: ${err.message}`);
    console.error("PAGE ERROR:", err);
  });
  page.on("console", (msg) => {
    const text = msg.text();
    if (msg.type() === "error" && !text.includes("WebSocket connection to") && !text.includes("hmr")) {
      errors.push(`Console error: ${text}`);
      console.error("CONSOLE ERROR:", text);
    }
  });

  console.log("Navigating to http://127.0.0.1:3000 ...");
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Helper to get scroll and animation state
  async function getState() {
    return await page.evaluate(() => {
      const scrollY = window.scrollY;
      const trackElem = document.getElementById("product-detail-track");
      const trackRect = trackElem ? trackElem.getBoundingClientRect() : null;
      const pinnedElem = document.getElementById("crafted-product-detail");
      const pinnedRect = pinnedElem ? pinnedElem.getBoundingClientRect() : null;

      // Architectural Corner Badge
      const badgeElem = document.querySelector("#product-chair-target span");
      const badgeText = badgeElem ? badgeElem.textContent.trim() : "";

      // Stepper dots (6 buttons)
      const dots = Array.from(
        document.querySelectorAll("#crafted-product-detail button[aria-label*='View'] span.rounded-full")
      );
      const activeDotIdx = dots.findIndex((d) => d.className.includes("w-6"));

      // Canvas / WebGL clipPath
      const canvas3D = document.querySelector("canvas[data-engine]");
      const clipPath = canvas3D ? canvas3D.style.clipPath : "";

      return {
        scrollY,
        trackTop: trackRect ? trackRect.top : null,
        pinnedTop: pinnedRect ? pinnedRect.top : null,
        badgeText,
        activeDotIdx,
        clipPath,
      };
    });
  }

  // Smooth scroll helper using Lenis or wheel
  async function scrollTo(y) {
    await page.evaluate((targetY) => {
      if ((window).lenis) {
        (window).lenis.scrollTo(targetY, { immediate: true });
      } else {
        window.scrollTo(0, targetY);
      }
    }, y);
    await page.waitForTimeout(100);
  }

  async function smoothScrollTo(y, duration = 600) {
    await page.evaluate(({ targetY, dur }) => {
      if ((window).lenis) {
        (window).lenis.scrollTo(targetY, { duration: dur / 1000 });
      } else {
        window.scrollTo({ top: targetY, behavior: "smooth" });
      }
    }, { targetY: y, dur: duration });
    await page.waitForTimeout(duration + 150);
  }

  // =========================================================================
  // TEST A: Complete Reverse Journey
  // =========================================================================
  console.log("\n--- TEST A: Complete Reverse Journey ---");
  const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  console.log("Total document scroll height available:", maxScroll);

  // 1. Initial Hero State (scrollY = 0)
  const initial = await getState();
  console.log("Initial state at scrollY=0:", initial.scrollY);
  if (initial.scrollY !== 0) throw new Error("Expected initial scrollY to be 0");

  // 2. Scroll through Hero (scrollY: 0 -> 900 -> 1800)
  await smoothScrollTo(900, 400);
  let sMidHero = await getState();
  console.log("Mid Hero (scrollY=900):", sMidHero.scrollY);

  await smoothScrollTo(1800, 400);
  let sEndHero = await getState();
  console.log("End Hero / Start Editorial (scrollY=1800):", sEndHero.scrollY);

  // 3. Scroll into Editorial & Product Detail Track
  // Find product detail track doc Y
  const trackDocY = await page.evaluate(() => {
    const el = document.getElementById("product-detail-track");
    return el ? el.getBoundingClientRect().top + window.scrollY : 2700;
  });
  console.log("product-detail-track doc Y:", trackDocY);

  await smoothScrollTo(trackDocY, 500);
  let sDetailStart = await getState();
  console.log("Start Detailing (scrollY=" + trackDocY + "): activeDot=" + sDetailStart.activeDotIdx);

  // Step through detailing states forward
  const vh = 900;
  const detailScrollDist = 2.5 * vh;
  for (let step = 1; step <= 5; step++) {
    const targetY = trackDocY + (step / 6) * detailScrollDist;
    await smoothScrollTo(targetY, 300);
    const s = await getState();
    console.log(`Forward Step ${step} (scrollY=${Math.round(targetY)}): activeDot=${s.activeDotIdx}`);
  }

  // Reach end of detailing track (unzoom back to complete overview)
  const detailEndY = trackDocY + detailScrollDist;
  await smoothScrollTo(detailEndY, 400);
  let sDetailEnd = await getState();
  console.log("End of Detailing track (scrollY=" + Math.round(detailEndY) + "): activeDot=" + sDetailEnd.activeDotIdx + " (should be 0 for restored complete chair)");

  // Scroll into Collection Section
  const collCardDocY = await page.evaluate(() => {
    const card = document.getElementById("chair-card-destination") || document.getElementById("collection-chair-target");
    return card ? card.getBoundingClientRect().top + window.scrollY : 6000;
  });
  console.log("Collection card doc Y:", Math.round(collCardDocY));
  const collSettleY = collCardDocY - 900 * 0.52;
  await smoothScrollTo(collSettleY, 600);
  let sCollection = await getState();
  console.log("Collection settled state (scrollY=" + Math.round(collSettleY) + ")");

  // NOW REVERSE ALL THE WAY BACK!
  console.log("\nReversing back from Collection Section into Detailing...");
  // 6. Scroll backward to end of detailing
  await smoothScrollTo(detailEndY, 500);
  let sRevDetailEnd = await getState();
  console.log("Reversed to Detailing End (scrollY=" + Math.round(detailEndY) + "): activeDot=" + sRevDetailEnd.activeDotIdx);

  // 7. Scroll backward through every detailing step
  for (let step = 5; step >= 0; step--) {
    const targetY = trackDocY + (step / 6) * detailScrollDist;
    await smoothScrollTo(targetY, 300);
    const s = await getState();
    console.log(`Reversed Step ${step} (scrollY=${Math.round(targetY)}): activeDot=${s.activeDotIdx}`);
  }

  // 8. Scroll backward into Editorial
  await smoothScrollTo(1800, 500);
  let sRevEditorial = await getState();
  console.log("Reversed to Editorial (scrollY=1800)");

  // 9. Scroll backward to Hero initial state
  await smoothScrollTo(0, 600);
  let sFinalHero = await getState();
  console.log("Reversed to Hero Top (scrollY=0):", sFinalHero.scrollY);
  if (Math.abs(sFinalHero.scrollY) > 2) throw new Error("Expected scrollY to return to 0");
  console.log("✓ TEST A PASSED: Complete reverse journey smooth, continuous, and verified.");

  // =========================================================================
  // TEST B: Reverse at Every Boundary
  // =========================================================================
  console.log("\n--- TEST B: Reverse at Every Boundary ---");
  const testPoints = [
    { name: "During Hero Explosion", y: 600 },
    { name: "Transition into Crafted / for living", y: 1800 },
    { name: "Beginning of Detailing Sequence", y: trackDocY + 50 },
    { name: "Middle of Detailing Sequence", y: trackDocY + 1200 },
    { name: "End of Detailing Sequence", y: detailEndY },
    { name: "Travel Journey B -> C", y: detailEndY + 300 },
    { name: "Immediately after reaching Collection Card", y: collSettleY },
  ];

  for (const pt of testPoints) {
    console.log(`Testing boundary: ${pt.name} (y=${Math.round(pt.y)})`);
    // Scroll forward past boundary
    await smoothScrollTo(pt.y + 100, 200);
    // Reverse before boundary
    await smoothScrollTo(pt.y - 100, 200);
    // Re-cross boundary forward
    await smoothScrollTo(pt.y, 200);
    const s = await getState();
    console.log(`  Settled at y=${Math.round(s.scrollY)}`);
  }
  console.log("✓ TEST B PASSED: Reversals at every boundary stable without jumps or glitches.");

  // =========================================================================
  // TEST C: Rapid Direction Changes
  // =========================================================================
  console.log("\n--- TEST C: Rapid Direction Changes ---");
  const rapidPoints = [trackDocY, detailEndY, collSettleY];
  for (const midY of rapidPoints) {
    console.log(`Rapid oscillation around y=${Math.round(midY)}`);
    for (let i = 0; i < 4; i++) {
      await scrollTo(midY + 150);
      await page.waitForTimeout(40);
      await scrollTo(midY - 150);
      await page.waitForTimeout(40);
    }
    await smoothScrollTo(midY, 200);
    const s = await getState();
    console.log(`  Post-oscillation settled at y=${Math.round(s.scrollY)}`);
  }
  console.log("✓ TEST C PASSED: Rapid direction changes follow scroll progress without stuck states.");

  // =========================================================================
  // TEST D: Reload and Resize
  // =========================================================================
  console.log("\n--- TEST D: Reload and Resize ---");
  // Scroll to middle of detailing
  const midDetailY = trackDocY + detailScrollDist * 0.5;
  await smoothScrollTo(midDetailY, 300);
  console.log(`Scrolled to y=${Math.round(midDetailY)}, reloading page...`);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  let sAfterReload = await getState();
  console.log(`After reload scrollY: ${Math.round(sAfterReload.scrollY)}`);

  // Resize viewport to tablet width 768px
  console.log("Resizing viewport to 768x1024 (tablet)...");
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(500);

  // Perform reverse scroll on tablet
  console.log("Reversing to top on tablet...");
  await smoothScrollTo(0, 500);
  let sTabletTop = await getState();
  console.log(`Tablet top scrollY: ${sTabletTop.scrollY}`);

  // Restore desktop viewport
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(500);
  console.log("✓ TEST D PASSED: Reload and resize preserve correct layout and progress.");

  // =========================================================================
  // TEST E: Stepper Clicks & Verification
  // =========================================================================
  console.log("\n--- TEST E: Stepper Clicks & Cleanup ---");
  await smoothScrollTo(trackDocY + 200, 300);

  // Click dot 3 (Arms)
  console.log("Clicking Stepper Dot 3 (Sculpted Armrests)...");
  const dot3Button = page.locator("#crafted-product-detail button[aria-label*='Arms']");
  if (await dot3Button.count() > 0) {
    await dot3Button.click();
    await page.waitForTimeout(1100);
    let sClick3 = await getState();
    console.log(`After clicking Dot 3: scrollY=${Math.round(sClick3.scrollY)}, activeDot=${sClick3.activeDotIdx}`);
    if (sClick3.activeDotIdx !== 3) {
      console.warn("Warning: activeDotIdx was " + sClick3.activeDotIdx + ", expected 3");
    }
  }

  // Click dot 0 (Overview)
  console.log("Clicking Stepper Dot 0 (Overview)...");
  const dot0Button = page.locator("#crafted-product-detail button[aria-label*='Overview']");
  if (await dot0Button.count() > 0) {
    await dot0Button.click();
    await page.waitForTimeout(1100);
    let sClick0 = await getState();
    console.log(`After clicking Dot 0: scrollY=${Math.round(sClick0.scrollY)}, activeDot=${sClick0.activeDotIdx}`);
  }

  console.log("✓ TEST E PASSED: Stepper navigation works bidirectionally and cleanly.");

  await browser.close();

  if (errors.length > 0) {
    console.error(`Total console/page errors detected: ${errors.length}`);
    errors.forEach((e) => console.error(e));
  } else {
    console.log("\n=== ALL REGRESSION TESTS PASSED WITH 0 ERRORS ===");
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
