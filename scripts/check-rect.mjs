import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  await page.evaluate(() => {
    document.getElementById("customisation")?.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(500);

  const rect = await page.evaluate(() => {
    const el = document.getElementById("customisation-chair-target");
    const r = el?.getBoundingClientRect();
    return r ? { top: r.top, left: r.left, width: r.width, height: r.height } : null;
  });

  console.log("CUSTOM CHAIR TARGET RECT:", rect);
  await browser.close();
}

main().catch(console.error);
