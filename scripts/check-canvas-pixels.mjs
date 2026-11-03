import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!window.__CHAIR_UPHOLSTERY_MAT, { timeout: 15000 });

  const mapPixels = await page.evaluate(() => {
    const mat = window.__CHAIR_UPHOLSTERY_MAT;
    const canvas = mat.map.image;
    if (!canvas || !canvas.getContext) return { error: "Not a canvas" };
    const ctx = canvas.getContext("2d");
    const data = ctx.getImageData(50, 50, 1, 1).data;
    return {
      width: canvas.width,
      height: canvas.height,
      pixelAt50: [data[0], data[1], data[2], data[3]],
    };
  });

  console.log("CANVAS TEXTURE PIXELS:", mapPixels);
  await browser.close();
}

main().catch(console.error);
