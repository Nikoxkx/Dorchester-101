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
  await sharp(svg, { density: 320 }).resize(1024, 1024).png().toFile(path.join(outDir, 'logo-1024.png'));
  const inner = await sharp(svg, { density: 320 }).resize(360, 360).png().toBuffer();
  await sharp({ create: { width: 512, height: 512, channels: 4, background: '#123D54' } })
    .composite([{ input: inner, gravity: 'centre' }])
    .png()
    .toFile(path.join(outDir, 'maskable-512.png'));
  await sharp(svg, { density: 320 }).resize(180, 180).flatten({ background: '#123D54' }).png().toFile(path.join(outDir, 'apple-touch-icon.png'));
  await sharp(svg, { density: 320 }).resize(32, 32).png().toFile(path.join(root, 'public', 'favicon.png'));
  await sharp(svg, { density: 320 }).resize(16, 16).png().toFile(path.join(root, 'public', 'favicon-16x16.png'));

  // A standards-compliant multi-image ICO using PNG-compressed entries. Current
  // browsers accept this format, and shipping both sizes keeps the tiny mark crisp.
  const icoEntries = await Promise.all([16, 32].map(async (size) => ({
    size,
    data: await sharp(svg, { density: 320 }).resize(size, size).png().toBuffer(),
  })));
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0);
  icoHeader.writeUInt16LE(1, 2);
  icoHeader.writeUInt16LE(icoEntries.length, 4);
  const icoDirectory = Buffer.alloc(16 * icoEntries.length);
  let icoOffset = icoHeader.length + icoDirectory.length;
  icoEntries.forEach(({ size, data }, index) => {
    const offset = index * 16;
    icoDirectory[offset] = size;
    icoDirectory[offset + 1] = size;
    icoDirectory.writeUInt16LE(1, offset + 4);
    icoDirectory.writeUInt16LE(32, offset + 6);
    icoDirectory.writeUInt32LE(data.length, offset + 8);
    icoDirectory.writeUInt32LE(icoOffset, offset + 12);
    icoOffset += data.length;
  });
  fs.writeFileSync(path.join(root, 'public', 'favicon.ico'), Buffer.concat([icoHeader, icoDirectory, ...icoEntries.map(({ data }) => data)]));
  console.log('wrote', fs.readdirSync(outDir).join(', '), 'and favicon PNG/ICO files');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
