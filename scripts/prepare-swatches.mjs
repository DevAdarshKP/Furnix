import { chromium } from "playwright";
import fs from "fs";
import path from "path";

async function processSwatches() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage();
  await page.setContent('<canvas id="c"></canvas>');

  const swatches = [
    { src: "public/images/chair_thumb_saffron.png", dest: "public/images/chair_thumb_yellow.png" },
    { src: "public/images/chair_thumb_sage.png", dest: "public/images/chair_thumb_light_green.png" },
    { src: "public/images/chair_thumb_charcoal.png", dest: "public/images/chair_thumb_grey.png" },
  ];

  for (const item of swatches) {
    if (!fs.existsSync(item.src)) {
      console.warn("Source not found:", item.src);
      continue;
    }
    const b64 = fs.readFileSync(item.src).toString("base64");
    const result = await page.evaluate((base64Data) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, img.width, img.height);
          const d = imgData.data;
          for (let i = 0; i < d.length; i += 4) {
            const r = d[i];
            const g = d[i + 1];
            const b = d[i + 2];
            // Remove white/light cream backgrounds to ensure clean transparency
            if (r > 230 && g > 230 && b > 215 && Math.abs(r - g) < 20 && Math.abs(r - b) < 25) {
              d[i + 3] = 0;
            }
          }
          ctx.putImageData(imgData, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };
        img.src = "data:image/png;base64," + base64Data;
      });
    }, b64);

    const buf = Buffer.from(result.split(",")[1], "base64");
    fs.writeFileSync(item.dest, buf);
    console.log(`Saved transparent swatch: ${item.dest} (${buf.length} bytes)`);
  }

  await browser.close();
  console.log("All swatch thumbnails prepared successfully!");
}

processSwatches().catch(console.error);
