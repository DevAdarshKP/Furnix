const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const TOTAL_FRAMES = 109;
const ORIGINAL_DIR = path.join(__dirname, '..', 'public', 'frames', 'chair');
const TRANSPARENT_DIR = path.join(__dirname, '..', 'public', 'frames', 'chair-transparent');

function getLegBounds(idx) {
  if (idx <= 32) {
    return { minX: 608, maxX: 672, minY: 720, maxY: 902 };
  } else if (idx <= 35) {
    return { minX: 580, maxX: 672, minY: 720, maxY: 915 };
  } else if (idx === 36) {
    return { minX: 565, maxX: 660, minY: 720, maxY: 930 };
  } else if (idx === 37) {
    return { minX: 550, maxX: 645, minY: 720, maxY: 940 };
  } else if (idx === 38) {
    return { minX: 535, maxX: 630, minY: 720, maxY: 950 };
  } else if (idx === 39) {
    return { minX: 518, maxX: 615, minY: 720, maxY: 960 };
  } else if (idx === 40) {
    return { minX: 510, maxX: 605, minY: 720, maxY: 968 };
  } else if (idx === 41) {
    return { minX: 505, maxX: 595, minY: 720, maxY: 976 };
  } else if (idx === 42) {
    return { minX: 500, maxX: 585, minY: 720, maxY: 976 };
  } else if (idx === 43) {
    return { minX: 495, maxX: 578, minY: 720, maxY: 976 };
  } else if (idx === 44) {
    return { minX: 492, maxX: 572, minY: 720, maxY: 976 };
  } else {
    return { minX: 490, maxX: 568, minY: 725, maxY: 978 };
  }
}

async function processFrame(idx) {
  const pad = String(idx).padStart(4, '0');
  const origPath = path.join(ORIGINAL_DIR, `frame_${pad}.webp`);
  const transPath = path.join(TRANSPARENT_DIR, `frame_${pad}.webp`);

  if (!fs.existsSync(origPath) || !fs.existsSync(transPath)) {
    console.error(`Frame ${idx} missing.`);
    return;
  }

  const origBuf = fs.readFileSync(origPath);
  const transBuf = fs.readFileSync(transPath);

  const { data: origData, info } = await sharp(origBuf).raw().toBuffer({ resolveWithObject: true });
  const { data: transData } = await sharp(transBuf).raw().toBuffer({ resolveWithObject: true });

  const width = info.width;
  const bounds = getLegBounds(idx);

  // 1. Clear any spurious pixels in the lower-left isolation quadrant
  // (In x in [400, 650] for y in [715, 985], only the front-left leg exists)
  for (let y = 715; y <= 985; y++) {
    for (let x = 400; x <= 650; x++) {
      const idx4 = (y * width + x) * 4;
      transData[idx4] = 0; transData[idx4 + 1] = 0; transData[idx4 + 2] = 0; transData[idx4 + 3] = 0;
    }
    // Also clear horizontal sliver below seat or right of attached leg foot
    for (let x = 650; x <= 700; x++) {
      if (y >= 885) {
        const idx4 = (y * width + x) * 4;
        transData[idx4] = 0; transData[idx4 + 1] = 0; transData[idx4 + 2] = 0; transData[idx4 + 3] = 0;
      }
    }
  }

  // 2. Extract and accurately matte the front-left leg within its physical bounds
  let legCount = 0;
  for (let y = bounds.minY; y <= bounds.maxY; y++) {
    const bgIdx = (y * width + 440) * 3;
    const bgR = origData[bgIdx];
    const bgG = origData[bgIdx + 1];
    const bgB = origData[bgIdx + 2];
    const bgLum = 0.299 * bgR + 0.587 * bgG + 0.114 * bgB;

    for (let x = bounds.minX; x <= bounds.maxX; x++) {
      // Avoid floor shadow streak at the very tip when leg is extended
      if (idx > 35 && y >= 965 && x > 525) continue;
      // In assembled state, avoid shadow right of the foot glide
      if (idx <= 35 && y >= 892 && x > 637) continue;

      const idx3 = (y * width + x) * 3;
      const idx4 = (y * width + x) * 4;

      const r = origData[idx3];
      const g = origData[idx3 + 1];
      const b = origData[idx3 + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);

      const isWood = (r > g + 8) && (g > b + 5) && (r - b > 18) && (lum < bgLum - 25);
      const isTip = (lum < 75 && (r > b + 6 || y >= 965)) && x <= 620;

      if ((isWood || isTip) && dist > 20) {
        const alpha = Math.min(255, Math.round(Math.max(0, (dist - 18) / 25) * 255));
        transData[idx4] = r;
        transData[idx4 + 1] = g;
        transData[idx4 + 2] = b;
        transData[idx4 + 3] = alpha;
        legCount++;
      }
    }
  }

  const outBuf = await sharp(transData, {
    raw: { width: info.width, height: info.height, channels: 4 }
  })
    .webp({ quality: 92, alphaQuality: 95, effort: 4 })
    .toBuffer();

  fs.writeFileSync(transPath, outBuf);
  return legCount;
}

async function run() {
  console.log(`Starting clean leg restoration for all ${TOTAL_FRAMES} frames...`);
  const t0 = Date.now();

  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const count = await processFrame(i);
    if (i % 20 === 0 || i === TOTAL_FRAMES || i === 1) {
      console.log(`[${i}/${TOTAL_FRAMES}] Restored ${count} pristine leg pixels`);
    }
  }

  const durationSec = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`Successfully completed all frames in ${durationSec}s!`);
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
