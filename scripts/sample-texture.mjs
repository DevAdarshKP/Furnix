import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!window.__CHAIR_UPHOLSTERY_MAT, { timeout: 15000 });

  const pixelData = await page.evaluate(() => {
    const mat = window.__CHAIR_UPHOLSTERY_MAT;
    const tex = mat.map;
    const img = tex.image;
    if (!img) return "No image";

    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, 100, 100);
    const data = ctx.getImageData(50, 50, 1, 1).data;
    return {
      width: img.width,
      height: img.height,
      pixelAt50: [data[0], data[1], data[2], data[3]],
    };
  });
  console.log("PIXEL DATA:", pixelData);
  await browser.close();
}

main().catch(console.error);
