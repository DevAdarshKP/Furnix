const { removeBackground } = require('@imgly/background-removal-node');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const url = require('url');

const TOTAL_FRAMES = 109;
const CONCURRENCY = 4;
const IN_DIR = path.join(__dirname, '..', 'public', 'frames', 'chair');
const OUT_DIR = path.join(__dirname, '..', 'public', 'frames', 'chair-transparent');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function processSingleFrame(idx) {
  const pad = String(idx).padStart(4, '0');
  const inFile = path.join(IN_DIR, `frame_${pad}.webp`);
  const outFile = path.join(OUT_DIR, `frame_${pad}.webp`);

  if (fs.existsSync(outFile) && fs.statSync(outFile).size > 10000) {
    return { idx, skipped: true };
  }

  const t0 = Date.now();
  const fileUrl = url.pathToFileURL(path.resolve(inFile)).href;
  const blob = await removeBackground(fileUrl);
  const buf = Buffer.from(await blob.arrayBuffer());
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });

  // Clean alpha channel: remove low alpha noise / faint streaks, smoothly rescale genuine parts
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a <= 32) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
    } else {
      data[i + 3] = Math.min(255, Math.round(((a - 32) / (255 - 32)) * 255));
    }
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 }
  })
    .webp({ quality: 90, alphaQuality: 95, effort: 4 })
    .toFile(outFile);

  const durationSec = ((Date.now() - t0) / 1000).toFixed(1);
  const sizeKb = Math.round(fs.statSync(outFile).size / 1024);
  return { idx, durationSec, sizeKb, skipped: false };
}

async function run() {
  console.log(`Starting transparent frame extraction for ${TOTAL_FRAMES} frames (concurrency: ${CONCURRENCY})...`);
  const queue = [];
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    queue.push(i);
  }

  let completed = 0;
  let active = 0;
  let indexInQueue = 0;

  return new Promise((resolve, reject) => {
    function next() {
      if (completed >= TOTAL_FRAMES) {
        return resolve();
      }

      while (active < CONCURRENCY && indexInQueue < queue.length) {
        const frameIdx = queue[indexInQueue++];
        active++;

        processSingleFrame(frameIdx)
          .then((res) => {
            active--;
            completed++;
            if (!res.skipped) {
              console.log(`[${completed}/${TOTAL_FRAMES}] Frame ${res.idx} done in ${res.durationSec}s (${res.sizeKb} KB)`);
            } else {
              console.log(`[${completed}/${TOTAL_FRAMES}] Frame ${res.idx} already exists, skipping.`);
            }
            next();
          })
          .catch((err) => {
            console.error(`Error processing frame ${frameIdx}:`, err);
            active--;
            completed++;
            next();
          });
      }
    }

    next();
  });
}

run().then(() => {
  console.log('All transparent frames successfully generated!');
  process.exit(0);
}).catch((err) => {
  console.error('Fatal batch error:', err);
  process.exit(1);
});
