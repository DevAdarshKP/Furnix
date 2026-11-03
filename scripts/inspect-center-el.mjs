import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  await page.evaluate(() => {
    document.getElementById("customisation")?.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(500);

  const elementsAtCenter = await page.evaluate(() => {
    const els = document.elementsFromPoint(720, 450);
    return els.map((el) => ({
      tagName: el.tagName,
      id: el.id,
      className: el.className,
      style: el.getAttribute("style"),
      innerHTMLSnippet: el.innerHTML.slice(0, 100),
    }));
  });

  console.log("ELEMENTS AT (720, 450):", JSON.stringify(elementsAtCenter, null, 2));
  await browser.close();
}

main().catch(console.error);
