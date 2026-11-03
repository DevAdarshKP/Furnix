import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!window.__CHAIR_UPHOLSTERY_MAT, { timeout: 15000 });

  const identity = await page.evaluate(() => {
    const mesh = window.__CHAIR_MESH;
    const uphMat = window.__CHAIR_UPHOLSTERY_MAT;
    return {
      sameRef: mesh.material[0] === uphMat,
      meshMatUuid: mesh.material[0].uuid,
      uphMatUuid: uphMat.uuid,
    };
  });

  console.log("IDENTITY CHECK:", identity);
  await browser.close();
}

main().catch(console.error);
