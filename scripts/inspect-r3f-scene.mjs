import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  const sceneTree = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    // Get Fiber root
    const key = Object.keys(canvas).find(k => k.startsWith("__reactFiber"));
    if (!key) return "No fiber key found";

    let fiber = canvas[key];
    while (fiber && !fiber.stateNode?.__r3f) {
      fiber = fiber.return;
    }

    if (!fiber || !fiber.stateNode?.__r3f) {
      // Traverse down or look at fiber state
      return "No r3f stateNode found";
    }

    const r3fScene = fiber.stateNode.__r3f.root.store.getState().scene;
    const objects = [];
    r3fScene.traverse((obj) => {
      objects.push({
        type: obj.type,
        name: obj.name,
        visible: obj.visible,
        isMesh: !!obj.isMesh,
        material: obj.material ? (Array.isArray(obj.material) ? obj.material.map(m => m.uuid) : obj.material.uuid) : null,
      });
    });
    return objects;
  });

  console.log("R3F SCENE TREE:", JSON.stringify(sceneTree, null, 2));
  await browser.close();
}

main().catch(console.error);
