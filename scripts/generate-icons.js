import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public');
const iconsDir = join(publicDir, 'icons');

// Ensure icons directory exists
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes to generate
const sizes = [192, 512];

// Create a simple Christmas tree icon
async function generateIcons() {
  // Create SVG with Christmas tree emoji on red background
  const svg = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" rx="64" fill="#b91c1c"/>
      <text x="256" y="360" font-size="280" text-anchor="middle" dominant-baseline="middle">🎄</text>
    </svg>
  `;

  const svgBuffer = Buffer.from(svg);

  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(iconsDir, `icon-${size}.png`));

    console.log(`Generated icon-${size}.png`);
  }

  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
