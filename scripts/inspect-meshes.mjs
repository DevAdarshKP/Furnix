import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!window.__CHAIR_UPHOLSTERY_MAT, { timeout: 15000 });

  const meshes = await page.evaluate(() => {
    const list = [];
    // Traverse the Three scene
    const canvas = document.querySelector("canvas");
    // Find Three scene through Fiber
    const fiberKey = Object.keys(canvas).find((k) => k.startsWith("__reactFiber"));
    return {
      windowMesh: window.__CHAIR_MESH ? {
        name: window.__CHAIR_MESH.name,
        materialsCount: Array.isArray(window.__CHAIR_MESH.material) ? window.__CHAIR_MESH.material.length : 1,
        materials: Array.isArray(window.__CHAIR_MESH.material) ? window.__CHAIR_MESH.material.map(m => ({
          name: m.name,
          color: m.color.getHexString(),
          uuid: m.uuid,
        })) : null,
      } : null,
    };
  });

  console.log("MESHES:", JSON.stringify(meshes, null, 2));
  await browser.close();
}

main().catch(console.error);
