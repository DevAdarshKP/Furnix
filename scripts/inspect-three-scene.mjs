import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!window.__CHAIR_MESH, { timeout: 15000 });
  await page.waitForTimeout(500);

  const tree = await page.evaluate(() => {
    const scene = window.__THREE_SCENE;
    const items = [];
    scene.traverse((obj) => {
      items.push({
        type: obj.type,
        name: obj.name,
        isMesh: !!obj.isMesh,
        matCount: obj.material ? (Array.isArray(obj.material) ? obj.material.length : 1) : 0,
      });
    });
    return items;
  });

  console.log("SCENE TREE AFTER LOAD:", JSON.stringify(tree, null, 2));
  await browser.close();
}

main().catch(console.error);
