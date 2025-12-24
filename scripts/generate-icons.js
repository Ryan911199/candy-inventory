import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync, readFileSync } from 'fs';

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

// Generate PNG icons from SVG
async function generateIcons() {
  const svgPath = join(iconsDir, 'icon.svg');
  const svgBuffer = readFileSync(svgPath);

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
