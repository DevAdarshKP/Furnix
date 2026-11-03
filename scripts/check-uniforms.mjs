import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!window.__CHAIR_UPHOLSTERY_MAT, { timeout: 15000 });
  await page.waitForTimeout(2000);

  const uniforms = await page.evaluate(() => {
    const mat = window.__CHAIR_UPHOLSTERY_MAT;
    return {
      color: mat.color.toArray(),
      userData: mat.userData,
      // If shader exists
      shaderUniforms: mat.__shader ? Object.keys(mat.__shader.uniforms) : null,
    };
  });
  console.log("UNIFORMS:", uniforms);
  await browser.close();
}

main().catch(console.error);
