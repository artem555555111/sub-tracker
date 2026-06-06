import { mkdir } from "node:fs/promises";
import sharp from "sharp";

// Generate PWA + platform icons from an inline SVG mark (indigo tile + white
// "spend bars"). Run: node scripts/gen-icons.mjs
const ROOT = "/Users/artsiom/sub-tracker";
const TOP = "#6366f1";
const BOTTOM = "#4338ca";

const bars = `
    <rect x="132" y="276" width="64" height="96"  rx="24" fill="#ffffff" fill-opacity="0.72"/>
    <rect x="224" y="212" width="64" height="160" rx="24" fill="#ffffff" fill-opacity="0.86"/>
    <rect x="316" y="152" width="64" height="220" rx="24" fill="#ffffff"/>`;

function svg({ size, maskable }) {
  const rx = maskable ? 0 : 112;
  const scale = maskable ? 0.72 : 0.92; // maskable keeps the glyph inside the safe zone
  return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${TOP}"/><stop offset="1" stop-color="${BOTTOM}"/>
  </linearGradient></defs>
  <rect width="512" height="512" rx="${rx}" fill="url(#g)"/>
  <g transform="translate(256 256) scale(${scale}) translate(-256 -256)">${bars}</g>
</svg>`;
}

async function png(opts, out) {
  await sharp(Buffer.from(svg(opts))).png().toFile(out);
  console.log("wrote", out);
}

await mkdir(`${ROOT}/public`, { recursive: true });
await png({ size: 192, maskable: false }, `${ROOT}/public/icon-192.png`);
await png({ size: 512, maskable: false }, `${ROOT}/public/icon-512.png`);
await png({ size: 512, maskable: true }, `${ROOT}/public/icon-maskable.png`);
await png({ size: 180, maskable: false }, `${ROOT}/src/app/apple-icon.png`);
console.log("done");
