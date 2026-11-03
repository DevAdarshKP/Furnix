import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!window.__CHAIR_UPHOLSTERY_MAT, { timeout: 15000 });

  await page.evaluate(() => {
    document.getElementById("customisation")?.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(500);

  const swatches = await page.$$('button[role="radio"]');

  // Helper to sample chair color from canvas
  async function sampleChair() {
    return await page.evaluate(() => {
      const canvas = document.querySelector("canvas");
      // Find canvas pixel near center of customisation chair (x=720, y=450 in 1440x900)
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      const pixels = new Uint8Array(4);
      // In WebGL, y=0 is bottom
      gl.readPixels(canvas.width / 2, canvas.height / 2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      return [pixels[0], pixels[1], pixels[2], pixels[3]];
    });
  }

  // 1. Initial Yellow
  await page.waitForTimeout(600);
  const pYellow = await sampleChair();
  console.log("Yellow chair center pixel [R, G, B, A]:", pYellow);

  // 2. Click Green
  await swatches[1].click();
  await page.waitForTimeout(600);
  const pGreen = await sampleChair();
  console.log("Green chair center pixel [R, G, B, A]:", pGreen);

  // 3. Click Grey
  await swatches[2].click();
  await page.waitForTimeout(600);
  const pGrey = await sampleChair();
  console.log("Grey chair center pixel [R, G, B, A]:", pGrey);

  await browser.close();
}

main().catch(console.error);
