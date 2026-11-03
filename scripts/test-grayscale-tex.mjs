import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!window.__CHAIR_UPHOLSTERY_MAT, { timeout: 15000 });

  const result = await page.evaluate(() => {
    const uphMat = window.__CHAIR_UPHOLSTERY_MAT;
    const sourceTex = uphMat.map;
    if (!sourceTex || !sourceTex.image) return { error: "No image" };

    const img = sourceTex.image;
    const start = performance.now();
    const canvas = document.createElement("canvas");
    canvas.width = img.width || 2048;
    canvas.height = img.height || 2048;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { error: "No 2D context" };

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const lum = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      d[i] = lum;
      d[i + 1] = lum;
      d[i + 2] = lum;
    }
    ctx.putImageData(imgData, 0, 0);
    const elapsed = performance.now() - start;

    return {
      type: img.constructor.name,
      width: canvas.width,
      height: canvas.height,
      elapsedMs: elapsed,
      samplePixelAt50: [imgData.data[200], imgData.data[201], imgData.data[202]],
    };
  });

  console.log("TEST GRAYSCALE RESULT:", result);
  await browser.close();
}

main().catch(console.error);
