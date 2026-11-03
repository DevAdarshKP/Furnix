import { chromium } from "playwright";
import fs from "fs";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage();

  const b64Yellow = fs.readFileSync("public/final_yellow.png").toString("base64");
  const b64Green = fs.readFileSync("public/final_green.png").toString("base64");
  const b64Grey = fs.readFileSync("public/final_grey.png").toString("base64");

  const diff = await page.evaluate(async ({ b64Y, b64G, b64Gr }) => {
    function loadImg(b64) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = "data:image/png;base64," + b64;
      });
    }
    const [imgY, imgG, imgGr] = await Promise.all([loadImg(b64Y), loadImg(b64G), loadImg(b64Gr)]);

    const canvas = document.createElement("canvas");
    canvas.width = 1440;
    canvas.height = 900;
    const ctx = canvas.getContext("2d");

    function getAvg(img) {
      ctx.clearRect(0, 0, 1440, 900);
      ctx.drawImage(img, 0, 0);
      // Sample upholstery backrest: x: 740..780, y: 320..360
      const d = ctx.getImageData(740, 320, 40, 40).data;
      let r = 0, g = 0, b = 0, count = d.length / 4;
      for (let i = 0; i < d.length; i += 4) {
        r += d[i]; g += d[i+1]; b += d[i+2];
      }
      return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
    }

    return {
      yellowBackrestRGB: getAvg(imgY),
      greenBackrestRGB: getAvg(imgG),
      greyBackrestRGB: getAvg(imgGr),
    };
  }, { b64Y: b64Yellow, b64G: b64Green, b64Gr: b64Grey });

  console.log("UPHOLSTERY BACKREST RGB SAMPLES:", diff);
  await browser.close();
}

main().catch(console.error);
