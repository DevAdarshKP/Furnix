import { chromium } from "playwright";
import fs from "fs";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!window.__CHAIR_UPHOLSTERY_MAT, { timeout: 15000 });

  const b64 = await page.evaluate(() => {
    const mat = window.__CHAIR_UPHOLSTERY_MAT;
    const canvas = mat.map.image;
    return canvas.toDataURL("image/png");
  });

  const base64Data = b64.replace(/^data:image\/png;base64,/, "");
  fs.writeFileSync("public/extracted_canvas.png", base64Data, "base64");
  console.log("Saved public/extracted_canvas.png");
  await browser.close();
}

main().catch(console.error);
