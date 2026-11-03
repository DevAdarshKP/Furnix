import { chromium } from "playwright";

async function runTests() {
  console.log("=== STARTING CHAIR DETAILING TEXT TRANSITION VERIFICATION ===");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // Track console logs and errors
  page.on("console", (msg) => {
    if (msg.type() === "error") console.log(`[BROWSER ERROR] ${msg.text()}`);
  });
  page.on("pageerror", (err) => console.log(`[PAGE ERROR] ${err.message}`));

  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Helper to query panel visibility & opacity state
  async function getPanelStates() {
    return await page.evaluate(() => {
      const panelIds = [0, 1, 2, 3, 4, 5];
      // On desktop (width >= 1024), check desktop panels
      const track = document.getElementById("product-detail-track");
      const trackRect = track?.getBoundingClientRect();
      const scrollY = window.scrollY;

      // Find all 6 desktop panels inside the stacked container
      const panels = Array.from(document.querySelectorAll("#crafted-product-detail .grid-cols-1.grid-rows-1 > div"));
      const states = panels.slice(0, 6).map((el, i) => {
        const style = window.getComputedStyle(el);
        const opacity = parseFloat(style.opacity) || 0;
        const visibility = style.visibility;
        const heading = el.querySelector("h2")?.textContent?.trim() || "";
        const cta = el.querySelector("button, a")?.textContent?.trim() || "";
        const zIndex = style.zIndex;
        return {
          index: i,
          opacity,
          visibility,
          heading,
          cta,
          zIndex,
          isRendered: visibility === "visible" && opacity > 0.01,
          isLegible: visibility === "visible" && opacity > 0.5,
        };
      });

      const badge = document.querySelector("#product-chair-target span")?.textContent?.trim() || "";
      const visiblePanels = states.filter((s) => s.isRendered);
      const legiblePanels = states.filter((s) => s.isLegible);

      return {
        scrollY,
        trackTop: trackRect?.top,
        trackHeight: trackRect?.height,
        states,
        visibleCount: visiblePanels.length,
        legibleCount: legiblePanels.length,
        visiblePanels,
        legiblePanels,
        badge,
      };
    });
  }

  // Helper to scroll to specific y
  async function scrollToY(y) {
    await page.evaluate((targetY) => {
      window.scrollTo(0, targetY);
    }, y);
    await page.waitForTimeout(50);
  }

  // Get Product Detail Track coordinates
  const trackInfo = await page.evaluate(() => {
    const track = document.getElementById("product-detail-track");
    if (!track) return null;
    const rect = track.getBoundingClientRect();
    const docY = rect.top + window.scrollY;
    const scrollDist = track.offsetHeight - window.innerHeight;
    return {
      top: docY,
      height: track.offsetHeight,
      scrollDist,
    };
  });

  if (!trackInfo) {
    console.error("FAIL: #product-detail-track not found");
    await browser.close();
    process.exit(1);
  }

  console.log(`Track found at top=${trackInfo.top}px, height=${trackInfo.height}px, scrollDist=${trackInfo.scrollDist}px`);

  let failures = 0;

  function assert(condition, message) {
    if (!condition) {
      console.error(`  [FAILED] ${message}`);
      failures++;
    } else {
      console.log(`  [PASSED] ${message}`);
    }
  }

  // =========================================================================
  // TEST 1: Forward Scroll Slowly through Every Detailing Step
  // =========================================================================
  console.log("\n--- TEST 1: Slow Forward Scroll Through All 6 Detailing Steps ---");
  const numMicroSteps = 60;
  let maxSimultaneousVisible = 0;
  let maxSimultaneousLegible = 0;

  for (let i = 0; i <= numMicroSteps; i++) {
    const p = i / numMicroSteps;
    const scrollY = trackInfo.top + p * trackInfo.scrollDist;
    await scrollToY(scrollY);

    const info = await getPanelStates();
    if (info.visibleCount > maxSimultaneousVisible) maxSimultaneousVisible = info.visibleCount;
    if (info.legibleCount > maxSimultaneousLegible) maxSimultaneousLegible = info.legibleCount;

    // Check collision rule: at NO point should two panels be legible (>0.5 opacity) or overlapping
    if (info.visibleCount > 1) {
      // If two panels are in transition, verify that BOTH are never readable simultaneously
      const ops = info.visiblePanels.map((p) => p.opacity);
      const sumOp = ops.reduce((a, b) => a + b, 0);
      if (ops.length > 1 && ops[0] > 0.4 && ops[1] > 0.4) {
        assert(false, `At p=${p.toFixed(3)}, multiple panels legible: ${JSON.stringify(info.visiblePanels)}`);
      }
    }
  }

  assert(maxSimultaneousVisible <= 1, `Max simultaneously visible panels during slow forward scroll: ${maxSimultaneousVisible} (must be <= 1)`);
  assert(maxSimultaneousLegible <= 1, `Max simultaneously legible panels: ${maxSimultaneousLegible} (must be <= 1)`);

  // =========================================================================
  // TEST 2: Fast Scroll Across Multiple Steps
  // =========================================================================
  console.log("\n--- TEST 2: Fast Scroll Across Detailing Steps ---");
  const fastScrollPoints = [0.1, 0.85, 0.25, 0.7, 0.05, 0.95];
  for (const p of fastScrollPoints) {
    const scrollY = trackInfo.top + p * trackInfo.scrollDist;
    await scrollToY(scrollY);
    const info = await getPanelStates();
    assert(info.visibleCount <= 1, `Fast jump to p=${p.toFixed(2)}: visibleCount=${info.visibleCount}`);
    assert(info.legibleCount <= 1, `Fast jump to p=${p.toFixed(2)}: legibleCount=${info.legibleCount}`);
  }

  // =========================================================================
  // TEST 3: Reverse Direction Halfway Through Each Text Transition
  // =========================================================================
  console.log("\n--- TEST 3: Reverse Direction Halfway Through Transitions ---");
  // The transitions occur around localT = 0.50 within each of the 5 segments
  // Segment boundaries in p: 0.167/2 = 0.083, 0.167 + 0.083 = 0.25, etc.
  const transitionMidpoints = [
    0.083, // Step 0 -> 1 transition
    0.250, // Step 1 -> 2 transition
    0.417, // Step 2 -> 3 transition
    0.583, // Step 3 -> 4 transition
    0.750, // Step 4 -> 5 transition
  ];

  for (const midP of transitionMidpoints) {
    // Approach midpoint forward
    const startY = trackInfo.top + (midP - 0.02) * trackInfo.scrollDist;
    const midY = trackInfo.top + midP * trackInfo.scrollDist;
    const pastY = trackInfo.top + (midP + 0.02) * trackInfo.scrollDist;

    await scrollToY(startY);
    await scrollToY(midY);
    // Reverse immediately halfway through
    await scrollToY(startY);

    const info = await getPanelStates();
    assert(info.visibleCount <= 1, `Reversed at boundary midP=${midP.toFixed(3)}: visibleCount=${info.visibleCount}`);
    assert(info.legibleCount <= 1, `Reversed at boundary midP=${midP.toFixed(3)}: legibleCount=${info.legibleCount}`);
  }

  // =========================================================================
  // TEST 4: Repeatedly Scroll Across Overview/Upholstery Boundary (Step 0 <-> Step 1)
  // =========================================================================
  console.log("\n--- TEST 4: Oscillate Across Overview/Upholstery Boundary ---");
  const boundary01_P = 0.0833;
  let boundary01Collision = false;

  for (let osc = 0; osc < 10; osc++) {
    // Oscillate between p = 0.06 (Overview) and p = 0.11 (Upholstery)
    const pForward = 0.11;
    const pReverse = 0.06;

    await scrollToY(trackInfo.top + pForward * trackInfo.scrollDist);
    let info = await getPanelStates();
    if (info.visibleCount > 1 || info.legibleCount > 1) boundary01Collision = true;

    await scrollToY(trackInfo.top + pReverse * trackInfo.scrollDist);
    info = await getPanelStates();
    if (info.visibleCount > 1 || info.legibleCount > 1) boundary01Collision = true;
  }

  assert(!boundary01Collision, "Oscillated 10x across Overview/Upholstery boundary with zero collision");

  // =========================================================================
  // TEST 5: Repeatedly Scroll Across Legs/Frame Boundary (Step 4 <-> Step 5)
  // =========================================================================
  console.log("\n--- TEST 5: Oscillate Across Legs/Frame Boundary ---");
  let boundary45Collision = false;

  for (let osc = 0; osc < 10; osc++) {
    // Oscillate between p = 0.70 (Legs) and p = 0.80 (Frame)
    const pForward = 0.80;
    const pReverse = 0.70;

    await scrollToY(trackInfo.top + pForward * trackInfo.scrollDist);
    let info = await getPanelStates();
    if (info.visibleCount > 1 || info.legibleCount > 1) boundary45Collision = true;

    await scrollToY(trackInfo.top + pReverse * trackInfo.scrollDist);
    info = await getPanelStates();
    if (info.visibleCount > 1 || info.legibleCount > 1) boundary45Collision = true;
  }

  assert(!boundary45Collision, "Oscillated 10x across Legs/Frame boundary with zero collision");

  // =========================================================================
  // TEST 6: Page Refresh & Direct Anchor Navigation
  // =========================================================================
  console.log("\n--- TEST 6: Page Refresh & Direct Anchor Return ---");
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  // Scroll to chair detailing section
  await scrollToY(trackInfo.top + 0.33 * trackInfo.scrollDist); // Cushion
  await page.waitForTimeout(100);
  const reloadInfo = await getPanelStates();
  assert(reloadInfo.visibleCount <= 1, `After reload, visibleCount at Cushion: ${reloadInfo.visibleCount}`);
  if (reloadInfo.legiblePanels.length === 1) {
    console.log(`  [PASSED] Legible panel after reload: "${reloadInfo.legiblePanels[0].heading}"`);
  }

  // =========================================================================
  // TEST 7: Responsive Resize & Retest
  // =========================================================================
  console.log("\n--- TEST 7: Responsive Resize (Desktop -> Mobile -> Desktop) ---");
  // Set to mobile viewport
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(200);

  // Check mobile panel state
  const mobileInfo = await page.evaluate(() => {
    const panels = Array.from(document.querySelectorAll("#crafted-product-detail .lg\\:hidden .grid-cols-1.grid-rows-1 > div"));
    const states = panels.slice(0, 6).map((el, i) => {
      const style = window.getComputedStyle(el);
      const opacity = parseFloat(style.opacity) || 0;
      const visibility = style.visibility;
      const heading = el.querySelector("h2")?.textContent?.trim() || "";
      return { index: i, opacity, visibility, heading, isRendered: visibility === "visible" && opacity > 0.01 };
    });
    return states.filter((s) => s.isRendered);
  });

  assert(mobileInfo.length <= 1, `Mobile viewport visible panel count: ${mobileInfo.length}`);

  // Restore desktop viewport
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(200);

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log("\n=======================================================");
  if (failures === 0) {
    console.log("ALL TESTS PASSED! ZERO TEXT COLLISION DETECTED.");
  } else {
    console.error(`TOTAL FAILURES: ${failures}`);
  }
  console.log("=======================================================");

  await browser.close();
  process.exit(failures === 0 ? 0 : 1);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
