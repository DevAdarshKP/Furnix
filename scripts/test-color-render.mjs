import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  page.on("console", (msg) => console.log("[Console]", msg.text()));

  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!window.__CHAIR_MESH, { timeout: 20000 });
  await page.waitForTimeout(1000);

  await page.evaluate(() => {
    document.getElementById("customisation")?.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(500);

  // Check what happens when we set color directly
  const renderInfo = await page.evaluate(() => {
    const mesh = window.__CHAIR_MESH;
    const mat0 = mesh.material[0];
    const mat1 = mesh.material[1];
    
    // Inspect materials
    return {
      mat0: {
        color: mat0.color.getHexString(),
        mapImageSrc: mat0.map?.image ? (mat0.map.image.toDataURL ? mat0.map.image.toDataURL().slice(0, 100) : "not-canvas") : "no-img",
        needsUpdate: mat0.needsUpdate,
        version: mat0.version,
      },
      mat1: {
        color: mat1.color.getHexString(),
        needsUpdate: mat1.needsUpdate,
        version: mat1.version,
      }
    };
  });

  console.log("RENDER INFO:", renderInfo);
  await browser.close();
}

main().catch(console.error);
