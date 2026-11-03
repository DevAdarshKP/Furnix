import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage();
  page.on("console", (msg) => {
    console.log(`[PAGE ${msg.type()}]`, msg.text());
  });
  page.on("pageerror", (err) => {
    console.log("[PAGE ERROR]", err);
  });

  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!window.__CHAIR_UPHOLSTERY_MAT, { timeout: 15000 });

  await page.evaluate(() => {
    document.getElementById("customisation")?.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(1000);

  const swatches = await page.$$('button[role="radio"]');
  console.log("Clicking Grey swatch (index 2)...");
  await swatches[2].click();
  await page.waitForTimeout(1000);

  const diag = await page.evaluate(() => {
    const mesh = window.__CHAIR_MESH;
    const uphMat = window.__CHAIR_UPHOLSTERY_MAT;
    return {
      meshMaterials: Array.isArray(mesh.material)
        ? mesh.material.map((m) => ({
            name: m.name,
            color: m.color.getHexString(),
            needsUpdate: m.needsUpdate,
          }))
        : mesh.material.name,
      uphColor: uphMat.color.getHexString(),
    };
  });
  console.log("DIAGNOSTICS:", JSON.stringify(diag, null, 2));

  await page.screenshot({ path: "public/diag_grey.png" });
  await browser.close();
}

main().catch(console.error);
