import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage();
  page.on("console", (msg) => {
    console.log(`[PAGE ${msg.type()}]`, msg.text());
  });
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  await browser.close();
}

main().catch(console.error);
