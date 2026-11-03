import { chromium } from "playwright";

async function capture() {
  console.log("=== CAPTURING HERO SHOWROOM SCREENSHOTS ===");
  const browser = await chromium.launch({ channel: "chrome", headless: true });

  const viewports = [
    { name: "desktop_1920", width: 1920, height: 1080 },
    { name: "desktop_1440", width: 1440, height: 900 },
    { name: "laptop_1366", width: 1366, height: 768 },
    { name: "tablet_768", width: 768, height: 1024 },
    { name: "mobile_390", width: 390, height: 844 },
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500); // Allow canvas frame to settle

    const filePath = `c:/my-react-works/Furnix/public/hero_${vp.name}.png`;
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`Saved screenshot: ${filePath}`);
    await context.close();
  }

  // Also test deconstruction frame capture at p = 0.25 (mid-explosion)
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Scroll down 400px (into deconstruction)
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(500);
  await page.screenshot({ path: "c:/my-react-works/Furnix/public/hero_deconstructed.png" });
  console.log("Saved deconstructed screenshot: c:/my-react-works/Furnix/public/hero_deconstructed.png");

  await browser.close();
  console.log("All screenshots captured successfully.");
}

capture().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
