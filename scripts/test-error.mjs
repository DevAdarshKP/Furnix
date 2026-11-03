import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage();
  page.on("console", (msg) => console.log(`[PAGE ${msg.type()}]`, msg.text()));

  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!window.__CHAIR_UPHOLSTERY_MAT, { timeout: 15000 });

  const test = await page.evaluate(() => {
    const uph = window.__CHAIR_UPHOLSTERY_MAT;
    return {
      hasOnBeforeCompile: typeof uph.onBeforeCompile === "function",
      onBeforeCompileStr: uph.onBeforeCompile ? uph.onBeforeCompile.toString() : null,
      customProgramCacheKey: uph.customProgramCacheKey ? uph.customProgramCacheKey() : null,
    };
  });
  console.log("TEST EVAL:", JSON.stringify(test, null, 2));
  await browser.close();
}

main().catch(console.error);
