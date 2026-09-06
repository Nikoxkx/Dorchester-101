// Renders the PNG icon set from public/icon.svg.
// Run with `node scripts/gen-icons.js` after changing the icon art; the browser
// needs more than one size, and a resized SVG served as a PNG is the only way to
// get pixel-exact launcher art without hand-maintaining a second source file.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const svgPath = path.join(root, 'public', 'icon.svg');
const outDir = path.join(root, 'public', 'icons');

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const svg = fs.readFileSync(svgPath);
  for (const size of [192, 256, 384, 512]) {
    await sharp(svg, { density: 320 }).resize(size, size).png().toFile(path.join(outDir, `icon-${size}.png`));
  }
  const inner = await sharp(svg, { density: 320 }).resize(360, 360).png().toBuffer();
  await sharp({ create: { width: 512, height: 512, channels: 4, background: '#1B3A6B' } })
    .composite([{ input: inner, gravity: 'centre' }])
    .png()
    .toFile(path.join(outDir, 'maskable-512.png'));
  await sharp(svg, { density: 320 }).resize(180, 180).flatten({ background: '#1B3A6B' }).png().toFile(path.join(outDir, 'apple-touch-icon.png'));
  console.log('wrote', fs.readdirSync(outDir).join(', '));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
