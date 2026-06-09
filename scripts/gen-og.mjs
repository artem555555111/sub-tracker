// Generates the social share image (Open Graph / Twitter), 1200x630.
// Static file at src/app/opengraph-image.png is auto-picked up by Next.
import { writeFileSync } from "node:fs";
import sharp from "sharp";

const W = 1200;
const H = 630;

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a0e1a"/>
      <stop offset="1" stop-color="#0f1830"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.15" r="0.6">
      <stop offset="0" stop-color="#6366f1" stop-opacity="0.38"/>
      <stop offset="1" stop-color="#6366f1" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- subscription cards motif (right side) -->
  <g transform="translate(760,150)" opacity="0.9">
    <rect x="0" y="0" width="340" height="78" rx="18" fill="#131c33" stroke="#243049"/>
    <circle cx="44" cy="39" r="18" fill="#6366f1"/>
    <rect x="78" y="26" width="150" height="12" rx="6" fill="#3a4660"/>
    <rect x="78" y="46" width="96" height="10" rx="5" fill="#2a3450"/>
    <rect x="270" y="30" width="46" height="16" rx="8" fill="#6366f1" opacity="0.5"/>
    <g transform="translate(0,98)"><rect width="340" height="78" rx="18" fill="#131c33" stroke="#243049"/>
      <circle cx="44" cy="39" r="18" fill="#22c55e"/>
      <rect x="78" y="26" width="120" height="12" rx="6" fill="#3a4660"/>
      <rect x="78" y="46" width="80" height="10" rx="5" fill="#2a3450"/>
      <rect x="270" y="30" width="46" height="16" rx="8" fill="#22c55e" opacity="0.5"/></g>
    <g transform="translate(0,196)"><rect width="340" height="78" rx="18" fill="#131c33" stroke="#243049"/>
      <circle cx="44" cy="39" r="18" fill="#f59e0b"/>
      <rect x="78" y="26" width="160" height="12" rx="6" fill="#3a4660"/>
      <rect x="78" y="46" width="70" height="10" rx="5" fill="#2a3450"/>
      <rect x="270" y="30" width="46" height="16" rx="8" fill="#f59e0b" opacity="0.5"/></g>
  </g>

  <text x="90" y="150" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="600" fill="#818cf8" letter-spacing="1">SUBSCRIPTION TRACKER</text>
  <text x="86" y="280" font-family="Helvetica, Arial, sans-serif" font-size="104" font-weight="800" fill="#f8fafc">SubTrack</text>
  <text x="90" y="360" font-family="Helvetica, Arial, sans-serif" font-size="44" font-weight="600" fill="#cbd5e1">Take control of your subscriptions.</text>
  <text x="90" y="430" font-family="Helvetica, Arial, sans-serif" font-size="30" fill="#94a3b8">Reminders · Multi-currency · AI audit · Private by design</text>
  <text x="90" y="560" font-family="Helvetica, Arial, sans-serif" font-size="28" font-weight="600" fill="#818cf8">sub-tracker-seven.vercel.app</text>
</svg>`;

const png = await sharp(Buffer.from(svg)).png().toBuffer();
writeFileSync("src/app/opengraph-image.png", png);
console.log("wrote src/app/opengraph-image.png", png.length, "bytes");
