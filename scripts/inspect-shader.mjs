import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage();

  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!window.__CHAIR_UPHOLSTERY_MAT, { timeout: 15000 });
  await page.waitForTimeout(2000); // wait for WebGL frames to render

  const shaderInfo = await page.evaluate(() => {
    const mat = window.__CHAIR_UPHOLSTERY_MAT;
    // Inspect materials cache or WebGL program
    const gl = document.querySelector("canvas")?.getContext("webgl2") || document.querySelector("canvas")?.getContext("webgl");
    return {
      matType: mat.type,
      color: mat.color.getHexString(),
      map: !!mat.map,
      mapImage: mat.map ? mat.map.image?.src || mat.map.name : null,
      customProgramCacheKey: mat.customProgramCacheKey ? mat.customProgramCacheKey() : null,
    };
  });
  console.log("SHADER INFO:", shaderInfo);
  await browser.close();
}

main().catch(console.error);
