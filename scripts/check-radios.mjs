import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  const radios = await page.$$eval('button[role="radio"]', (els) =>
    els.map((e) => ({
      label: e.getAttribute("aria-label"),
      visible: e.offsetParent !== null,
    }))
  );
  console.log("RADIOS:", radios);
  await browser.close();
}

main().catch(console.error);
