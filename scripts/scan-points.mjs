import { chromium } from "playwright";
import fs from "fs";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage();

  const b64Green = fs.readFileSync("public/final_green.png").toString("base64");

  const colors = await page.evaluate(async (b64) => {
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = "data:image/png;base64," + b64; });
    const canvas = document.createElement("canvas");
    canvas.width = 1440;
    canvas.height = 900;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const points = [
      { name: "backrest-top", x: 760, y: 300 },
      { name: "backrest-mid", x: 760, y: 360 },
      { name: "seat-cushion", x: 760, y: 440 },
      { name: "left-armrest", x: 640, y: 400 },
      { name: "right-armrest", x: 880, y: 400 },
      { name: "wood-leg-left", x: 620, y: 580 },
    ];

    return points.map(p => {
      const d = ctx.getImageData(p.x, p.y, 1, 1).data;
      return { ...p, rgb: [d[0], d[1], d[2]] };
    });
  }, b64Green);

  console.log("PIXELS ON GREEN CHAIR SCREENSHOT:", colors);
  await browser.close();
}

main().catch(console.error);
